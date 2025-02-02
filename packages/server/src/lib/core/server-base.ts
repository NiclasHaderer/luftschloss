/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { Constructor, EventHandler, Subscribable } from "@luftschloss/common";
import http, { IncomingMessage, Server, ServerResponse } from "http";
import { Duplex } from "stream";
import { ReadonlyMiddlewares } from "../middleware";
import { ResolvedRoute, Router } from "../router";
import { LRequest } from "./request";
import { RequestImpl } from "./request-impl";
import { LResponse } from "./response";
import { ResponseImpl } from "./response-impl";
import { HTTP_METHODS, LookupResultStatus } from "./route-collector.model";
import * as console from "console";

export type LuftServerEvents = {
  startup: void;
  startupComplete: void;
  shutdown: void;
  routerMerged: { router: Router; basePath: string };
  locked: void;
};

export interface ServerBase extends Pick<Subscribable<LuftServerEvents>, "onComplete" | "on"> {
  readonly raw: Server;
  readonly isStarted: boolean;
  readonly isShutdown: boolean;

  get address(): URL;

  listen(port?: number, hostname?: string): Promise<void>;

  _testBootstrap(): Promise<void>;

  shutdown(options?: { gracePeriod: number }): Promise<void>;

  handleIncomingRequest(req: IncomingMessage, res: ServerResponse): void;

  lock(): void;
}

// noinspection JSPotentiallyInvalidUsageOfThis
export const withServerBase = <T extends Router, ARGS extends any[]>(
  clazz: Constructor<T, ARGS>
): Constructor<T & ServerBase, ARGS> =>
  class extends (clazz as Constructor<Router, ARGS>) implements ServerBase {
    protected eventDelegate = new EventHandler<LuftServerEvents>();
    public on = this.eventDelegate.on.bind(this.eventDelegate);
    public onComplete = this.eventDelegate.onComplete.bind(this.eventDelegate);
    private readonly startTime = Date.now();
    private readonly openSockets = new Set<Duplex>();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    private readonly nodeServer = http.createServer(this.handleIncomingRequest.bind(this));
    private _isShutDown = false;
    private _shutDownInProgress?: Promise<void>;

    public constructor(...args: ARGS) {
      super(...args);
      // Call *this* routers onMount method, so that the lifecycle chain can begin
      this.onMount(this, undefined, "", "");
    }

    private _isStarted = false;

    public get isStarted() {
      return this._isStarted;
    }

    public get address(): URL {
      const address = this.nodeServer.address();
      if (address === null) {
        throw new Error("Server is not listening");
      }

      if (typeof address === "string") {
        return new URL(address);
      }
      return new URL(`http://${address.address}:${address.port}`);
    }

    /**
     * Get the raw server instance used internally
     */
    public get raw(): Server {
      return this.nodeServer;
    }

    public get isShutdown() {
      return this._isShutDown;
    }

    /**
     * This method is the entry point for every incoming request processed by the server.
     * @param req The native node request
     * @param res The native node response
     * @internal Should not be used by the user.
     */
    public async handleIncomingRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
      const request = new RequestImpl(req);
      const response = new ResponseImpl(res, request);
      const route = this.resolveRoute(request.path, request.method);
      request.setPathParams(route.pathParams);
      await this.executeRequest(request, response, route);
    }

    public override resolveRoute(path: string, method: HTTP_METHODS): ResolvedRoute {
      const route = super.resolveRoute(path, method);
      if (method === "OPTIONS" && route.status !== LookupResultStatus.OK) {
        return {
          ...route,
          status: LookupResultStatus.OK,
          executor: async (req, res) => res.empty().header("Allow", route.availableMethods),
        };
      }
      return route;
    }

    /**
     * This method is used for locking the server and all the routers which are attached to the router.
     * After locking the server it is no longer possible to add/remove routes, pathValidators, etc...
     * This has to be done in order to not allow non-reproducible behaviour and to make some optimizations internally.
     */
    public override async lock(): Promise<void> {
      // Call the routers lock method
      await super.lock();
      this.eventDelegate.emit("locked", undefined);
    }

    public async _testBootstrap(): Promise<void> {
      if (this.locked) {
        throw new Error("Server was already passed to a testing client");
      }

      await this.lock();
      await this.eventDelegate.complete("startup", undefined);
      await this.eventDelegate.complete("startupComplete", undefined);
    }

    /**
     * Start the server and start processing incoming requests
     * @param port The port the server should be listening on (default=3200)
     * @param hostname And the host the server should be listening on (default="0.0.0.0")
     */
    public async listen(port = 3200, hostname = "0.0.0.0"): Promise<void> {
      if (this.locked) throw new Error("Server was already started");
      await this.lock();

      const runningServer = this.nodeServer.listen(port, hostname, () => {
        console.log(`Server is listening on ${this.address}`);
        console.log(`Server startup took ${Date.now() - this.startTime}ms`);
        this._isStarted = true;

        // Why is this wrapped in a setTimeout?
        // Because sometimes the listen callback is called before the server is "really" ready and if you try to send
        // a request to the server right after the listen callback was called using 'fetch' the request will sometimes
        // fail...
        setTimeout(() => {
          void this.eventDelegate
            .complete("startup", undefined)
            .then(() => this.eventDelegate.complete("startupComplete", undefined));
        });
      });

      // Collect the sockets, so I can gracefully shut down the server
      this.collectOpenConnections(runningServer);

      // Wait for a server shutdown
      await new Promise<void>(resolve => {
        process.on(`SIGINT`, () => {
          if (this._shutDownInProgress) {
            void this._shutDownInProgress.then(resolve);
            return;
          }
          this.shutdown()
            .then(() => console.log("Server shutdown successfully"))
            .then(resolve)
            .catch(console.error);
        });
        process.on(`exit`, () => {
          if (this._shutDownInProgress) {
            void this._shutDownInProgress.then(resolve);
            return;
          }
          this.shutdown()
            .then(() => console.log("Server shutdown successfully"))
            .then(resolve)
            .catch(console.error);
        });
      });
    }

    /**
     * Shut down the server. After the gracePeriod of 1s every open connection will be destroyed
     * @param gracePeriod How long should the server wait until forcefully shutting down open connections
     */
    public shutdown({ gracePeriod = 1000 } = {}): Promise<void> {
      if (this._shutDownInProgress) return this._shutDownInProgress;

      this._shutDownInProgress = new Promise<void>((resolve, reject) => {
        if (this._isShutDown) resolve();
        console.log("Shutting down server");
        let timeout: NodeJS.Timeout | undefined = undefined;

        // The server is not really listening if the mock client is used
        // However shutting down is still necessary to close the open connections, call the shutdown hooks, etc...
        if (this.nodeServer.listening) {
          this.nodeServer.close(err => {
            this._isShutDown = true;
            clearTimeout(timeout!);
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }

        timeout = setTimeout(() => {
          this.openSockets.forEach(s => s.destroy());
          resolve();
        }, gracePeriod);
      }).then(() => this.eventDelegate.complete("shutdown", undefined));
      return this._shutDownInProgress;
    }

    private async executeRequest(request: RequestImpl, response: ResponseImpl, route: ResolvedRoute) {
      const middlewareLength = route.middlewares.length;
      const next = async (
        request: LRequest,
        response: LResponse,
        middlewares: ReadonlyMiddlewares,
        position: number
      ) => {
        if (position >= middlewareLength) {
          await route.executor(request, response);
        } else {
          await middlewares[position].handle(
            async (req: LRequest, res: LResponse) => {
              await next(req, res, middlewares, position + 1);
            },
            request,
            response
          );
        }
      };

      await next(request, response, route.middlewares, 0);
    }

    /**
     * Used to keep track of the open connections, so they can be closed forcefully in the shutdown method
     */
    private collectOpenConnections(server: http.Server): void {
      server.on("connection", socket => {
        this.openSockets.add(socket);
        socket.on("close", () => this.openSockets.delete(socket));
      });
    }
  } as unknown as Constructor<T & ServerBase, ARGS>;
