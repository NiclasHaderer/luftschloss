/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import http, { IncomingMessage, ServerResponse } from "http"
import { Duplex } from "stream"
import { DEFAULT_PATH_VALIDATOR_NAME, defaultPathValidator, PathValidator, PathValidators } from "../path-validator"
import { Router } from "../router"
import { Constructor } from "../types"
import { RequestPipeline } from "./request-pipeline"
import { RouterMerger } from "./router-merger"
import { Observable, Subject } from "./subject"

export interface ServerBase {
  addPathValidator(validator: PathValidator<any>): this

  removePathValidator(validatorOrName: PathValidator<any> | PathValidator<any>["name"]): this

  listen(port?: number, hostname?: string): Promise<void>

  _testBootstrap(): void

  shutdown(options: { gracePeriod: 100 }): Promise<Error | undefined>

  handleIncomingRequest(req: IncomingMessage, res: ServerResponse): void

  lock(): void

  readonly shutdown$: Observable<void>

  readonly start$: Observable<void>

  readonly routerMerged$: Observable<{ router: Router; basePath: string }>
}

export const withServerBase = <T extends Router, ARGS extends []>(
  clazz: Constructor<T, ARGS>
): Constructor<T & ServerBase, ARGS> =>
  class extends (clazz as Constructor<Router, ARGS>) implements ServerBase {
    private readonly _shutdown$ = new Subject<void>()
    private readonly _start$ = new Subject<void>()
    private readonly startTime = Date.now()
    private readonly openSockets = new Set<Duplex>()
    private pathValidators: PathValidators = {
      [DEFAULT_PATH_VALIDATOR_NAME]: defaultPathValidator(),
    }
    private readonly requestPipeline = new RequestPipeline(this.middleware)
    private readonly routeMerger = new RouterMerger(this.pathValidators)
    private readonly server = http.createServer(this.handleIncomingRequest.bind(this))

    public readonly shutdown$ = this._shutdown$.asObservable()
    public readonly start$ = this._start$.asObservable()
    public readonly routerMerged$ = this.routeMerger.routerMerged$

    public constructor(...args: ARGS) {
      super(...args)
    }

    public handleIncomingRequest(req: IncomingMessage, res: ServerResponse): void {
      this.requestPipeline.queue(req, res).then(/**/).catch(console.error)
    }

    public addPathValidator(validator: PathValidator<any>): this {
      if (this.locked) {
        throw new Error("Cannot add new validator after server has been started")
      }
      this.pathValidators[validator.name] = validator
      return this
    }

    public removePathValidator(validatorOrName: PathValidator<any> | PathValidator<any>["name"]): this {
      if (this.locked) {
        throw new Error("Cannot remove validator after server has been started")
      }

      if (typeof validatorOrName === "string") {
        if (validatorOrName === DEFAULT_PATH_VALIDATOR_NAME) {
          throw new Error("Cannot remove default validator")
        }
        delete this.pathValidators[validatorOrName]
      } else {
        if (validatorOrName.name === DEFAULT_PATH_VALIDATOR_NAME) {
          throw new Error("Cannot remove default validator")
        }
        delete this.pathValidators[validatorOrName.name]
      }
      return this
    }

    public override lock(): void {
      this.routeMerger.lock()
      this.requestPipeline.lock(this.routeMerger.entries())
      super.lock()
    }

    public _testBootstrap(): void {
      if (this.locked) {
        throw new Error("Server was already passed to a testing client")
      }

      this.routeMerger.mergeIn(this, this, { basePath: "/" }, [])
      this.lock()
      //noinspection JSPotentiallyInvalidUsageOfThis
      this._start$.next()
      //noinspection JSPotentiallyInvalidUsageOfThis
      this._start$.complete()
    }

    public async listen(port = 3200, hostname = "0.0.0.0"): Promise<void> {
      if (this.locked) {
        throw new Error("Server was already started")
      }

      this.routeMerger.mergeIn(this, this, { basePath: "/" }, [])
      this.lock()

      const runningServer = this.server.listen(port, hostname, () => {
        console.log(`Server is listening on http://${hostname}:${port}`)
        console.log(`Server startup took ${Date.now() - this.startTime}ms`)
        this._start$.next()
        this._start$.complete()
      })

      // Collect the sockets, so I can gracefully shut down the server
      this.collectOpenConnections(runningServer)

      // Wait for a server shutdown
      await new Promise<void>(resolve => {
        //eslint-disable-next-line @typescript-eslint/no-misused-promises
        process.on(`SIGINT`, async () => {
          await this.shutdown()
          resolve()
        })
        //eslint-disable-next-line @typescript-eslint/no-misused-promises
        process.on(`exit`, async () => {
          await this.shutdown()
          resolve()
        })
      })
    }

    public shutdown({ gracePeriod } = { gracePeriod: 100 }): Promise<Error | undefined> {
      return new Promise(resolve => {
        this.server.close(resolve)
        setTimeout(() => {
          this.openSockets.forEach(s => s.destroy())
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
