import * as http from "http"
import { RequestPipeline } from "./request-pipeline"
import { defaultErrorHandler, ErrorHandler } from "./error-handler"
import { errorMiddleware } from "../middleware/error.middleware"
import { Observable, Subject } from "./subject"
import { loggerMiddleware } from "../middleware/logger.middleware"
import { DefaultRouter } from "../router/default.router"
import { RouteCollectorWrapper } from "./route-controller-wrapper"

export type EventData = {
  data: Record<string, any>
}

class ServerImpl extends DefaultRouter {
  // Emits an event which indicates that the server has started
  public readonly handleEnd$: Observable<EventData>

  // Emits an event which indicates that the server has stopped
  public readonly handleStart$: Observable<EventData>

  private readonly _shutdown$ = new Subject<void>()
  private readonly _start$ = new Subject<void>()

  private readonly startTime = Date.now()

  // Server shutdown event
  public readonly shutdown$ = this._shutdown$.asObservable()

  // Server start event
  public readonly start$ = this._start$.asObservable()
  private readonly _requestPipeline: RequestPipeline
  private readonly _server: http.Server
  private readonly routeCollector: RouteCollectorWrapper

  constructor(private errorResponseHandler: ErrorHandler) {
    super()
    this.routeCollector = new RouteCollectorWrapper()
    this._requestPipeline = new RequestPipeline(this.routeCollector, errorResponseHandler)
    this.handleStart$ = this._requestPipeline.handleStart$
    this.handleEnd$ = this._requestPipeline.handleEnd$
    this._server = http.createServer(async (req, res) => {
      await this._requestPipeline.queue(req, res)
    })
  }

  public listen(port: number = 3200): void {
    this.routeCollector.mergeIn(this)
    this.lock()

    this._server.listen(port, "0.0.0.0", () => {
      console.log(`Server is listening on http://0.0.0.0:${port}`)
      console.log(`Server startup took ${Date.now() - this.startTime}ms`)
      this._start$.next()
    })
  }
}

export const defaultServer = (): ServerImpl => {
  const errorHandler = { ...defaultErrorHandler }
  const server = new ServerImpl(errorHandler)
  server.pipe(loggerMiddleware(), errorMiddleware(errorHandler))
  return server
}
