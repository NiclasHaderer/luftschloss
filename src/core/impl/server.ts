import { EventData, Server } from "../interfaces/server"
import * as http from "http"
import { RequestPipeline } from "./request-pipeline"
import { RouterImpl } from "./router"
import { ErrorHandler } from "../interfaces/error-handler"
import { defaultErrorHandler } from "./error-handler"
import { errorMiddleware } from "../../middleware/error.middleware"
import { Observable, Subject } from "./subject"

class ServerImpl extends RouterImpl implements Server {
  // Emits an event which indicates that the server has started
  public readonly handleEnd$: Observable<EventData>

  // Emits an event which indicates that the server has stopped
  public readonly handleStart$: Observable<EventData>

  /* tslint:disable:member-ordering */
  private _shutdown$ = new Subject<void>()
  private _start$ = new Subject<void>()
  // Server shutdown event
  public readonly shutdown$ = this._shutdown$.asObservable()

  // Server start event
  public readonly start$ = this._start$.asObservable()
  private _requestPipeline: RequestPipeline
  private readonly _server: http.Server

  /* tslint:enable:member-ordering */

  constructor(private errorResponseHandler: ErrorHandler) {
    super()
    this._requestPipeline = new RequestPipeline(this.routes, errorResponseHandler)
    this.handleStart$ = this._requestPipeline.handleStart$
    this.handleEnd$ = this._requestPipeline.handleEnd$
    this._server = http.createServer(async (req, res) => {
      await this._requestPipeline.queue(req, res)
    })
  }

  public listen(port: number = 3200): void {
    const startTime = Date.now()
    this._server.listen(port, "0.0.0.0", () => {
      console.log(`Server is listening on http://0.0.0.0:${port}`)
      console.log(`Server startup took ${Date.now() - startTime}ms`)
      this._start$.next()
    })
  }
}

export const createServer = (): Server => {
  const errorHandler = { ...defaultErrorHandler }
  const server = new ServerImpl(errorHandler)
  server.pipe(errorMiddleware(errorHandler))
  return server
}
