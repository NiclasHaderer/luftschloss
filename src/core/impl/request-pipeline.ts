import { IncomingMessage as In, ServerResponse as Out } from "http"
import { Subject } from "rxjs"
import { EventData } from "../types/server"
import { RequestImpl } from "./request"
import { ReadonlyRouteCollector } from "../types/route-controller"
import { ErrorResponseHandler } from "../types/error-response-handler"
import { HTTPException } from "./http-exception"
import { Status } from "./status"
import { Request } from "../types/request"

export class RequestPipeline {
  /* tslint:disable:member-ordering */
  private readonly _handleEnd$ = new Subject<EventData>()
  private readonly _handleStart$ = new Subject<EventData>()

  public readonly handleEnd$ = this._handleEnd$.asObservable()
  public readonly handleStart$ = this._handleStart$.asObservable()

  /* tslint:enable:member-ordering */

  constructor(private routeCollector: ReadonlyRouteCollector, private errorResponseHandler: ErrorResponseHandler) {}

  public queue = async (req: In, res: Out) =>
    // Add request start and end handling
    this.withStart(async () => {
      // Wrap the node request in own
      const requestImpl = new RequestImpl(req, res)

      await catchErrors(this.errorResponseHandler, requestImpl, async () => {
        // Get the request handler for a certain url
        const requestExecutor = this.routeCollector.retrieve(requestImpl.url, requestImpl.method)
      })
    })

  private async withStart(callback: () => Promise<void>): Promise<void> {
    // Create data which will be shared between the start and end handler
    const startEndData = { data: {} }
    this._handleStart$.next(startEndData)

    await callback()

    // Message the request end handler
    this._handleEnd$.next(startEndData)
  }
}

export const catchErrors = async (
  errorHandlers: ErrorResponseHandler,
  request: Request,
  callback: () => Promise<void>
) => {
  try {
    await callback()
  } catch (e) {
    if (!(e instanceof HTTPException)) {
      e = HTTPException.wrap(e as Error, Status.HTTP_500_INTERNAL_SERVER_ERROR)
    }
    const error= e as HTTPException

    if (error.status.key in errorHandlers) {
      errorHandlers[error.status.key]!(error, request)
    } else {
      errorHandlers.DEFAULT(error, request)
    }
  }
}
