import { Constructor } from "../types"
import { DEFAULT_PATH_VALIDATOR_NAME, defaultPathValidator, PathValidator, PathValidators } from "../path-validator"
import { Observable, Subject } from "./subject"
import { EventData } from "./server"
import { RouterMerger } from "./router-merger"
import { RequestPipeline } from "./request-pipeline"
import http from "http"
import { Duplex } from "stream"
import { Router } from "../router"

export interface ServerBase {
  addPathValidator(validator: PathValidator<any>): this

  removePathValidator(validatorOrName: PathValidator<any> | PathValidator<any>["name"]): this

  listen(port?: number, hostname?: string): Promise<void>

  shutdown(options: { gracePeriod: 100 }): Promise<Error | undefined>

  lock(): void
}

export const withServerBase = <T extends Router, ARGS extends []>(
  clazz: Constructor<T, ARGS>
): Constructor<T & ServerBase, ARGS> => {
  return class extends (clazz as Constructor<Router, ARGS>) implements ServerBase {
    private readonly _shutdown$ = new Subject<void>()
    private readonly _start$ = new Subject<void>()
    private readonly startTime = Date.now()
    private readonly openSockets = new Set<Duplex>()
    private validators: PathValidators = {
      [DEFAULT_PATH_VALIDATOR_NAME]: defaultPathValidator(),
    }
    private readonly requestPipeline: RequestPipeline
    private readonly server: http.Server
    private readonly routeMerger: RouterMerger

    // Emits an event which indicates that the server has started
    public readonly handleEnd$: Observable<EventData>
    // Emits an event which indicates that the server has stopped
    public readonly handleStart$: Observable<EventData>
    // Server shutdown event
    public readonly shutdown$ = this._shutdown$.asObservable()
    // Server start event
    public readonly start$ = this._start$.asObservable()

    constructor(...args: ARGS) {
      super(...args)
      this.routeMerger = new RouterMerger(this.validators)
      this.requestPipeline = new RequestPipeline(this.middleware)
      this.handleStart$ = this.requestPipeline.handleStart$
      this.handleEnd$ = this.requestPipeline.handleEnd$
      this.server = http.createServer(async (req, res) => {
        await this.requestPipeline.queue(req, res)
      })
    }

    public addPathValidator(validator: PathValidator<any>): this {
      if (this.locked) {
        throw new Error("Cannot add new validator after server has been started")
      }
      this.validators[validator.name] = validator
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
        delete this.validators[validatorOrName]
      } else {
        if (validatorOrName.name === DEFAULT_PATH_VALIDATOR_NAME) {
          throw new Error("Cannot remove default validator")
        }
        delete this.validators[validatorOrName.name]
      }
      return this
    }

    public override lock(): void {
      this.routeMerger.lock()
      super.lock()
    }

    public async listen(port: number = 3200, hostname: string = "0.0.0.0"): Promise<void> {
      this.routeMerger.mergeIn(this, { basePath: "/" }, [])
      this.lock()
      this.requestPipeline.lock(this.routeMerger.entries())

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
        process.on(`SIGINT`, async () => {
          await this.shutdown()
          resolve()
        })
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
}
