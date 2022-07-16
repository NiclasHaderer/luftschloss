/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { Constructor, GenericEventEmitter, normalizePath, saveObject, withDefaults } from "@luftschloss/core"
import http, { IncomingMessage, Server, ServerResponse } from "http"
import { Duplex } from "stream"
import { MountingOptions, Router } from "../router"
import { RequestPipeline } from "./request-pipeline"
import { RouterMerger } from "./router-merger"

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
    private readonly requestPipeline = new RequestPipeline(this.middlewares)
    private readonly routeMerger = new RouterMerger({}, this.eventDelegate)
    private readonly _server = http.createServer(this.handleIncomingRequest.bind(this))

    public constructor(...args: ARGS) {
      super(...args)
    }

    public get raw(): Server {
      return this._server
    }

    public handleIncomingRequest(req: IncomingMessage, res: ServerResponse): void {
      this.requestPipeline.queue(req, res).then(/**/).catch(console.error)
    }

    public override lock(): void {
      this.routeMerger.lock()
      this.requestPipeline.lock(this.routeMerger.entries())
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

      this.routeMerger.mergeIn(this, this, { basePath: "/" }, [])
      this.lock()
      this.eventDelegate.complete("start", undefined)
    }

    public async listen(port = 3200, hostname = "0.0.0.0"): Promise<void> {
      if (this.locked) {
        throw new Error("Server was already started")
      }

      this.routeMerger.mergeIn(this, this, { basePath: "/" }, [])
      this.lock()

      const runningServer = this._server.listen(port, hostname, () => {
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

    public shutdown({ gracePeriod = 1000 } = {}): Promise<void> {
      return new Promise((resolve, reject) => {
        this._server.close(err => {
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

    private collectOpenConnections(server: http.Server): void {
      server.on("connection", socket => {
        this.openSockets.add(socket)
        socket.on("close", () => this.openSockets.delete(socket))
      })
    }
  } as unknown as Constructor<T & ServerBase, ARGS>
