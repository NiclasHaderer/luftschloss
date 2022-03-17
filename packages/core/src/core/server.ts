import * as http from "http"
import { Server } from "http"
import { RequestPipeline } from "./request-pipeline"
import { defaultErrorHandler, ErrorHandler } from "./error-handler"
import { errorMiddleware, loggerMiddleware, requestCompleter } from "../middleware"
import { Observable, Subject } from "./subject"
import { DefaultRouter } from "../router"
import { RouterMerger } from "./router-merger"
import {
  DEFAULT_PATH_VALIDATOR_NAME,
  defaultPathValidator,
  intPathValidator,
  numberPathValidator,
  pathPathValidator,
  PathValidator,
  PathValidators,
  stringPathValidator,
  uuidPathValidator,
} from "../path-validator"
import { Duplex } from "stream"

export type EventData = {
  data: Record<string, any>
}

class ServerImpl extends DefaultRouter {
  private readonly _shutdown$ = new Subject<void>()
  private readonly _start$ = new Subject<void>()
  private readonly startTime = Date.now()
  private readonly requestPipeline: RequestPipeline
  private readonly server: http.Server
  private readonly routeMerger: RouterMerger
  private readonly openSockets = new Set<Duplex>()
  private validators: PathValidators = {
    [DEFAULT_PATH_VALIDATOR_NAME]: defaultPathValidator(),
  }

  // Emits an event which indicates that the server has started
  public readonly handleEnd$: Observable<EventData>
  // Emits an event which indicates that the server has stopped
  public readonly handleStart$: Observable<EventData>
  // Server shutdown event
  public readonly shutdown$ = this._shutdown$.asObservable()
  // Server start event
  public readonly start$ = this._start$.asObservable()

  constructor() {
    super()
    this.routeMerger = new RouterMerger(this.validators)
    this.requestPipeline = new RequestPipeline(this.middleware)
    this.handleStart$ = this.requestPipeline.handleStart$
    this.handleEnd$ = this.requestPipeline.handleEnd$
    this.server = http.createServer(async (req, res) => {
      await this.requestPipeline.queue(req, res)
    })
  }

  public addPathValidator(validator: PathValidator<any>): this {
    if (this.locked) throw new Error("Cannot add new validator after server has been started")
    this.validators[validator.name] = validator
    return this
  }

  public removePathValidator(validatorOrName: PathValidator<any> | PathValidator<any>["name"]): this {
    if (this.locked) throw new Error("Cannot remove validator after server has been started")

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

    // Inform any shutdown event listener
    await this._shutdown$.nextAsync()
    this._shutdown$.complete()
  }

  private collectOpenConnections(server: Server): void {
    server.on("connection", socket => {
      this.openSockets.add(socket)
      socket.on("close", () => this.openSockets.delete(socket))
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
}

export const defaultServer = (errorHandlers: Partial<ErrorHandler> = {}): ServerImpl => {
  const server = new ServerImpl()
  server.pipe(loggerMiddleware(), requestCompleter(), errorMiddleware({ ...defaultErrorHandler, ...errorHandlers }))
  server
    .addPathValidator(intPathValidator())
    .addPathValidator(numberPathValidator())
    .addPathValidator(pathPathValidator())
    .addPathValidator(stringPathValidator())
    .addPathValidator(uuidPathValidator())
  return server
}
