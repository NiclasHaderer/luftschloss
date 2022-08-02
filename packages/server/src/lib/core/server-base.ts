/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { Constructor, GenericEventEmitter, normalizePath, saveObject, withDefaults } from "@luftschloss/core"
import http, { IncomingMessage, Server, ServerResponse } from "http"
import { Duplex } from "stream"
import { MountingOptions, Router } from "../router"
import { RequestImpl } from "./request-impl"
import { ResponseImpl } from "./response-impl"
import { ReadonlyMiddlewares } from "../middleware"
import { LRequest } from "./request"
import { LResponse } from "./response"

export type LuftServerEvents = {
  start: void
  shutdown: void
  routerMerged: { router: Router; basePath: string }
  lock: void
}

export interface ServerBase extends Pick<GenericEventEmitter<LuftServerEvents>, "onComplete" | "on"> {
  readonly raw: Server

  listen(port?: number, hostname?: string): Promise<void>

  _testBootstrap(): void

  shutdown(options: { gracePeriod: 100 }): Promise<void>

  handleIncomingRequest(req: IncomingMessage, res: ServerResponse): void

  lock(): void
}

// noinspection JSPotentiallyInvalidUsageOfThis
export const withServerBase = <T extends Router, ARGS extends []>(
  clazz: Constructor<T, ARGS>
): Constructor<T & ServerBase, ARGS> =>
  class extends (clazz as Constructor<Router, ARGS>) implements ServerBase {
    protected eventDelegate = new GenericEventEmitter<LuftServerEvents>()
    public on = this.eventDelegate.on.bind(this.eventDelegate)
    public onComplete = this.eventDelegate.onComplete.bind(this.eventDelegate)
    private readonly startTime = Date.now()
    private readonly openSockets = new Set<Duplex>()
    private readonly nodeServer = http.createServer(this.handleIncomingRequest.bind(this))

    public constructor(...args: ARGS) {
      super(...args)
      // Call *this* routers onMount method, so that the lifecycle chain can begin
      this.onMount(this, undefined, "")
    }

    /**
     * Get the raw server instance used internally
     */
    public get raw(): Server {
      return this.nodeServer
    }

    /**
     * This method is the entry point for every incoming request processed by the server.
     * @param req The native node request
     * @param res The native node response
     * @internal Should not be used by the user.
     */
    public async handleIncomingRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
      const request = new RequestImpl(req)
      const response = new ResponseImpl(res, request)
      const route = this.resolveRoute(request.path, request.method)
      await this.executeRequest(request, response, route)
    }

    private async executeRequest(
      request: RequestImpl,
      response: ResponseImpl,
      route: ReturnType<Router["resolveRoute"]>
    ) {
      const middlewareLength = route.middlewares.length
      const next = async (
        request: LRequest,
        response: LResponse,
        middlewares: ReadonlyMiddlewares,
        position: number
      ) => {
        if (position >= middlewareLength) {
          await route.executor(request, response)
        } else {
          await middlewares[position].handle(
            async (req: LRequest, res: LResponse) => {
              await next(req, res, middlewares, position + 1)
            },
            request,
            response
          )
        }
      }

      await next(request, response, route.middlewares, 0)
    }

    /**
     * This method is used for locking the server and all the routers which are attached to the router.
     * After locking the server it is no longer possible to add/remove routes, pathValidators, etc...
     * This has to be done in order to not allow non-reproducible behaviour and to make some optimizations internally.
     */
    public lock(): void {
      // TODO call some hooks?
      super.lock()
    }

    /**
     * The server triggers the on mount event which will cause the mountEvent of all other routers which have been attached
     * to the server to get triggered
     * @param routers The router or the router you want to attach to the server
     * @param options Some options for the mounting the router
     */
    public override mount(routers: Router[] | Router, options: Partial<MountingOptions> = saveObject()): this {
      const completeOptions = withDefaults<MountingOptions>(options, { basePath: "/" })

      if (this.locked) {
        throw new Error("Router has been locked. You cannot mount any new routers")
      }
      super.mount(routers, completeOptions)

      if (!Array.isArray(routers)) {
        routers = [routers]
      }

      // the complete path is in our case the base path, because the server is the root router
      routers.forEach(r => r.onMount(this, this, normalizePath(completeOptions.basePath)))
      return this
    }

    public _testBootstrap(): void {
      if (this.locked) {
        throw new Error("Server was already passed to a testing client")
      }

      // TODO call some lifecycle hooks (or is lock enough?)
      this.lock()
      this.eventDelegate.complete("start", undefined)
    }

    /**
     * Start the server and start processing incoming requests
     * @param port The port the server should be listening on (default=3200)
     * @param hostname And the host the server should be listening on (default="0.0.0.0")
     */
    public async listen(port = 3200, hostname = "0.0.0.0"): Promise<void> {
      if (this.locked) throw new Error("Server was already started")
      this.lock()

      const runningServer = this.nodeServer.listen(port, hostname, () => {
        console.log(`Server is listening on http://${hostname}:${port}`)
        console.log(`Server startup took ${Date.now() - this.startTime}ms`)
        this.eventDelegate.complete("start", undefined)
      })

      // Collect the sockets, so I can gracefully shut down the server
      this.collectOpenConnections(runningServer)

      // Wait for a server shutdown
      await new Promise<void>(resolve => {
        process.on(`SIGINT`, async () => {
          await this.shutdown()
          console.log("Server shutdown successfully")
          this.eventDelegate.complete("shutdown", undefined)
          resolve()
        })
        process.on(`exit`, async () => {
          await this.shutdown()
          console.log("Server shutdown successfully")
          this.eventDelegate.complete("shutdown", undefined)
          resolve()
        })
      })
    }

    /**
     * Shut down the server. After the gracePeriod of 1s every open connection will be destroyed
     * @param gracePeriod How long should the server wait until forcefully shutting down open connections
     */
    public shutdown({ gracePeriod = 1000 } = {}): Promise<void> {
      return new Promise((resolve, reject) => {
        this.nodeServer.close(err => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
        setTimeout(() => {
          this.openSockets.forEach(s => s.destroy())
          resolve(undefined)
        }, gracePeriod)
      })
    }

    /**
     * Used to keep track of the open connections, so they can be closed forcefully in the shutdown method
     */
    private collectOpenConnections(server: http.Server): void {
      server.on("connection", socket => {
        this.openSockets.add(socket)
        socket.on("close", () => this.openSockets.delete(socket))
      })
    }
  } as unknown as Constructor<T & ServerBase, ARGS>