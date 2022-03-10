import * as http from "http"
import { RequestPipeline } from "./request-pipeline"
import { defaultErrorHandler, ErrorHandler } from "./error-handler"
import { errorMiddleware } from "../middleware/error.middleware"
import { Observable, Subject } from "./subject"
import { loggerMiddleware } from "../middleware/logger.middleware"
import { DefaultRouter } from "../router/default.router"
import { RouterMerger } from "./router-merger"
import { requestCompleter } from "../middleware/request-completer.middleware"
import { PathValidator, PathValidators } from "../path-validator/validator"
import { DEFAULT_VALIDATOR_KEY, defaultPathValidator } from "../path-validator/default"

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
  private validators: PathValidators = {
    [DEFAULT_VALIDATOR_KEY]: defaultPathValidator(),
  }

  // Emits an event which indicates that the server has started
  public readonly handleEnd$: Observable<EventData>
  // Emits an event which indicates that the server has stopped
  public readonly handleStart$: Observable<EventData>
  // Server shutdown event
  public readonly shutdown$ = this._shutdown$.asObservable()
  // Server start event
  public readonly start$ = this._start$.asObservable()

  constructor(private errorResponseHandler: ErrorHandler) {
    super()
    this.routeMerger = new RouterMerger()
    this.requestPipeline = new RequestPipeline(errorResponseHandler)
    this.handleStart$ = this.requestPipeline.handleStart$
    this.handleEnd$ = this.requestPipeline.handleEnd$
    this.server = http.createServer(async (req, res) => {
      await this.requestPipeline.queue(req, res)
    })
  }

  public addPathValidator(validator: PathValidator<any>): this {
    // TODO make sure that the regex does not include a capture group. Every regex which uses a group should use a non
    // TODO capture group
    if (this.locked) throw new Error("Cannot add new validator after server has been started")
    this.validators[validator.name] = validator
    return this
  }

  public removePathValidator(validatorOrName: PathValidator<any> | PathValidator<any>["name"]): this {
    if (this.locked) throw new Error("Cannot remove validator after server has been started")

    if (typeof validatorOrName === "string") {
      if (validatorOrName === DEFAULT_VALIDATOR_KEY) {
        throw new Error("Cannot remove default validator")
      }
      delete this.validators[validatorOrName]
    } else {
      if (validatorOrName.name === DEFAULT_VALIDATOR_KEY) {
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

  public async listen(port: number = 3200): Promise<void> {
    this.routeMerger.mergeIn(this, { basePath: "/" }, this.middleware)
    this.requestPipeline.lock(this.routeMerger.entries())
    this.lock()

    this.server.listen(port, "0.0.0.0", () => {
      console.log(`Server is listening on http://0.0.0.0:${port}`)
      console.log(`Server startup took ${Date.now() - this.startTime}ms`)
      this._start$.next()
      this._start$.complete()
    })

    await new Promise<void>(resolve => {
      process.on(`SIGINT`, async () => {
        await this.shutdown()
        resolve()
      })
      process.on(`exit`, resolve)
    })
    await this._shutdown$.nextAsync()
    this._shutdown$.complete()
  }

  public shutdown(): Promise<Error | undefined> {
    return new Promise(resolve => this.server.close(resolve))
  }
}

export const defaultServer = (): ServerImpl => {
  const errorHandler = { ...defaultErrorHandler }
  const server = new ServerImpl(errorHandler)
  server.pipe(loggerMiddleware(), requestCompleter(), errorMiddleware(errorHandler))
  return server
}
