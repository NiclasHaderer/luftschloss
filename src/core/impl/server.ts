import { EventData, Server } from "../types/server"
import { Observable } from "rxjs"
import * as http from "http"
import { RequestPipeline } from "./request-pipeline"
import { RouterImpl } from "./router"
import { ErrorHandler } from "../types/error-handler"
import { defaultErrorHandler } from "./error-handler"
import { RequestExecutorMiddleware } from "../../middleware/request-executor.middleware"

class ServerImpl extends RouterImpl implements Server {
  public readonly handleEnd$: Observable<EventData>

  public readonly handleStart$: Observable<EventData>
  public readonly shutdown$ = new Observable<void>()
  public readonly start$ = new Observable<void>()
  private _requestPipeline: RequestPipeline
  private readonly _server: http.Server

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
    this._server.listen(port, "0.0.0.0", () => {
      console.log(`Server is listening on http://0.0.0.0:${port}`)
    })
  }
}

export const createServer = (): Server => {
  const server = new ServerImpl({
    ...defaultErrorHandler,
  })
  server.pipe(RequestExecutorMiddleware)
  return server
}
