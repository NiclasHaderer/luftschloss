import { IncomingMessage as In, ServerResponse as Out } from "http"
import { Subject } from "./subject"
import { RequestImpl } from "./request"
import {
  LookupResultStatus,
  RetrievableRouteCollector,
  RouteLookupResult,
  SuccessfulRouteLookupResult,
} from "./route-collector.model"
import { ResponseImpl } from "./response"
import { Status } from "./status"
import { ErrorHandler } from "./error-handler"
import { HTTPException } from "./http-exception"
import { MiddlewareRepresentation, MiddlewareType, NextFunction } from "../middleware/middleware"
import { EventData } from "./server"

export class RequestPipeline {
  private readonly _handleEnd$ = new Subject<EventData>()
  private readonly _handleStart$ = new Subject<EventData>()
  public readonly handleEnd$ = this._handleEnd$.asObservable()
  public readonly handleStart$ = this._handleStart$.asObservable()

  constructor(private routingController: RetrievableRouteCollector, private errorHandler: ErrorHandler) {}

  public queue = async (req: In, res: Out) =>
    // Add request start and end handling
    this.withStart(async () => {
      // Wrap the node request/response in own implementation
      const request = new RequestImpl(req)
      const response = new ResponseImpl(res)

      // Get the request handler for a certain url
      const tmp = this.routingController.retrieve(request.url, request.method)

      // Get a successful result and if the lookup was not successful send it to the error handler
      const requestExecutor = this.unwrapExecutor(tmp, request, response)

      // Not successful, so ignore it
      if (!requestExecutor) return

      // Create chain which will run the middleware and the callback
      const executionChain = buildExecutionChain(requestExecutor)
      await executionChain.run(request, response)
    })

  /**
   * Unwrap the routeLookup and handle the case that a route was not found, or the wrong method was used
   */
  private unwrapExecutor(
    routeLookup: RouteLookupResult,
    request: RequestImpl,
    response: ResponseImpl
  ): SuccessfulRouteLookupResult | null {
    switch (routeLookup.status) {
      case LookupResultStatus.METHOD_NOT_ALLOWED: {
        const e = this.errorHandler.HTTP_405_METHOD_NOT_ALLOWED || this.errorHandler.DEFAULT
        e(new HTTPException(Status.HTTP_405_METHOD_NOT_ALLOWED), request, response)
        return null
      }
      case LookupResultStatus.NOT_FOUND: {
        const e = this.errorHandler.HTTP_404_NOT_FOUND || this.errorHandler.DEFAULT
        e(new HTTPException(Status.HTTP_404_NOT_FOUND), request, response)
        return null
      }
      case LookupResultStatus.OK:
        return routeLookup
    }
  }

  /**
   * Call the request start and request end lifecycle hooks
   */
  private async withStart(callback: () => Promise<void>): Promise<void> {
    // Create data which will be shared between the start and end handler
    const startEndData = { data: {} }
    this._handleStart$.next(startEndData)

    // Execute the main request
    await callback()

    // Message the request end handler
    this._handleEnd$.next(startEndData)
  }
}

const buildExecutionChain = (route: SuccessfulRouteLookupResult) => {
  const pipeline = [...route.pipeline]
  return {
    run(req: RequestImpl, res: ResponseImpl): void {
      let index = -1
      const executionWrapper = (request: RequestImpl, response: ResponseImpl) => {
        index += 1
        if (index >= pipeline.length) return route.executor(request, response)
        executeMiddleware(pipeline[index], request, response, executionWrapper)
      }
      executionWrapper(req, res)
    },
  }
}

const executeMiddleware = (
  middleware: MiddlewareRepresentation,
  request: RequestImpl,
  response: ResponseImpl,
  next: NextFunction
) => {
  switch (middleware.type) {
    case MiddlewareType.HTTP:
      middleware.rep(next, request, response)
      break
    case MiddlewareType.CLASS:
      middleware.rep.handle(next, request, response)
      break
  }
}
