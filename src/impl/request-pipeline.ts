import { IncomingMessage, ServerResponse } from "http"
import { Subject } from "rxjs"
import { EventData } from "../types/server"
import { MiddlewareRepresentation, MiddlewareType } from "../types/middleware"
import { RequestImpl } from "./request"
import { ReadonlyRouteCollector, RouteRetrieval } from "../types/route-controller"
import { ErrorResponseHandler } from "../types/error-response-handler"
import { ServerError } from "./server-error"
import { Request } from "../types/request"

export class RequestPipeline {
  /* tslint:disable:member-ordering */
  private readonly _handleEnd$ = new Subject<EventData>()
  private readonly _handleStart$ = new Subject<EventData>()

  public readonly handleEnd$ = this._handleEnd$.asObservable()
  public readonly handleStart$ = this._handleStart$.asObservable()

  /* tslint:enable:member-ordering */

  constructor(private routeCollector: ReadonlyRouteCollector, private errorResponseHandler: ErrorResponseHandler) {}

  public async queue(req: IncomingMessage, res: ServerResponse): Promise<void> {
    // Create data which will be shared between the start and end handler
    const startEndData = { data: {} }
    this._handleStart$.next(startEndData)

    // Wrap the node request in own
    const requestImpl = new RequestImpl(req, res)
    // Get the request handler for a certain url
    const requestExecutor = this.routeCollector.retrieve(requestImpl.url, requestImpl.method)

    // Check if handlers for the request could be found
    switch (requestExecutor.type) {
      case RouteRetrieval.METHOD_NOT_ALLOWED:
        this.errorResponseHandler.METHOD_NOT_ALLOWED(requestImpl)
        return
      case RouteRetrieval.NOT_FOUND:
        this.errorResponseHandler.NOT_FOUND(requestImpl)
        return
      case RouteRetrieval.OK:
        break
    }

    // Execute the middleware. If the middleware completes the request DON'T call the route handler
    await catchErrors(this.errorResponseHandler, requestImpl, async () => {
      await RequestPipeline.callRequestMiddleware(requestExecutor.pipeline, requestImpl)
    })

    if (requestImpl.completed) return

    // Execute the route handler
    await catchErrors(this.errorResponseHandler, requestImpl, async () => {
      await requestExecutor.executor(requestImpl)
    })

    // Message the request end handler
    this._handleEnd$.next(startEndData)
  }

  private static async callRequestMiddleware(
    middleware: Iterable<MiddlewareRepresentation>,
    requestElement: RequestImpl
  ): Promise<void> {
    for (const middlewareElement of middleware) {
      switch (middlewareElement.type) {
        case MiddlewareType.HTTP:
          // Http middleware
          middlewareElement.rep(requestElement)
          break
        case MiddlewareType.RX:
          // Rx middleware, so create a new subject and pipe the request through
          const s = new Subject()
          s.next(requestElement)
          s.complete()
          // @ts-ignore
          await lastValueFrom(s.pipe(...middlewareElement))
          break
      }
    }
  }
}

const catchErrors = async (
  errorResponseHandler: ErrorResponseHandler,
  request: Request,
  callback: () => Promise<void> | void
) => {
  try {
    await callback()
  } catch (e) {
    if (e instanceof ServerError) {
      errorResponseHandler.SERVER_ERROR(e, request)
    } else {
      errorResponseHandler.INTERNAL_ERROR(e as Error, request)
    }
  }
}
