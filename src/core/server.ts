import * as http from "http"
import { RequestPipeline } from "./request-pipeline"
import { defaultErrorHandler, ErrorHandler } from "./error-handler"
import { errorMiddleware } from "../middleware/error.middleware"
import { Observable, Subject } from "./subject"
import { loggerMiddleware } from "../middleware/logger.middleware"
import { DefaultRouter } from "../router/default.router"
import { RouteCollectorWrapper } from "./route-controller-wrapper"
import { requestCompleter } from "../middleware/request-completer.middleware"
import { stringPathValidator } from "../path-validator/string"
import { numberPathValidator } from "../path-validator/number"
import { PathValidator } from "./route-collector.model"

export type EventData = {
  data: Record<string, any>
}

class ServerImpl extends DefaultRouter {
  private readonly _shutdown$ = new Subject<void>()
  private readonly _start$ = new Subject<void>()
  private readonly startTime = Date.now()
  private readonly _requestPipeline: RequestPipeline
  private readonly _server: http.Server
  private readonly routeCollector: RouteCollectorWrapper

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
    this.routeCollector = new RouteCollectorWrapper()
    this.routeCollector.addPathValidator(stringPathValidator()).addPathValidator(numberPathValidator())
    this._requestPipeline = new RequestPipeline(this.routeCollector, errorResponseHandler)
    this.handleStart$ = this._requestPipeline.handleStart$
    this.handleEnd$ = this._requestPipeline.handleEnd$
    this._server = http.createServer(async (req, res) => {
      await this._requestPipeline.queue(req, res)
    })
  }

  public withPathValidator(validator: PathValidator<any>): this {
    this.routeCollector.addPathValidator(validator)
    return this
  }

  public async listen(port: number = 3200): Promise<void> {
    this.routeCollector.mergeIn(this)
    this.lock()

    this._server.listen(port, "0.0.0.0", () => {
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
    return new Promise(resolve => this._server.close(resolve))
  }
}

export const defaultServer = (): ServerImpl => {
  const errorHandler = { ...defaultErrorHandler }
  const server = new ServerImpl(errorHandler)
  server.pipe(loggerMiddleware(), requestCompleter(), errorMiddleware(errorHandler))
  return server
}
