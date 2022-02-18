import { IncomingMessage as In, ServerResponse as Out } from "http"
import { Subject } from "./subject"
import { EventData } from "../interfaces/server"
import { RequestImpl } from "./request"
import {
  ReadonlyRoutingController,
  RouteLookupResult,
  RouteRetrieval,
  SuccessfulRouteLookupResult,
} from "../interfaces/routing-controller"
import { ErrorHandler } from "../interfaces/error-handler"
import { Request } from "../interfaces/request"
import { ResponseImpl } from "./response"
import { Response } from "../interfaces/response"
import { HTTPException } from "ts-server/core/impl/http-exception"
import { Status } from "ts-server/core/impl/status"
import { MiddlewareRepresentation, MiddlewareType, NextFunction } from "ts-server/core/interfaces/middleware"

export class RequestPipeline {
  /* tslint:disable:member-ordering */
  private readonly _handleEnd$ = new Subject<EventData>()
  private readonly _handleStart$ = new Subject<EventData>()
  public readonly handleEnd$ = this._handleEnd$.asObservable()
  public readonly handleStart$ = this._handleStart$.asObservable()

  /* tslint:enable:member-ordering */

  constructor(private routingController: ReadonlyRoutingController, private errorHandler: ErrorHandler) {}

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
      const executionChain = buildExecutionChain(requestExecutor)
      await executionChain.run(request, response)
    })

  private unwrapExecutor(
    routeLookup: RouteLookupResult,
    request: Request,
    response: Response
  ): SuccessfulRouteLookupResult | null {
    switch (routeLookup.type) {
      case RouteRetrieval.METHOD_NOT_ALLOWED: {
        const e = this.errorHandler.HTTP_405_METHOD_NOT_ALLOWED || this.errorHandler.DEFAULT
        e(new HTTPException(Status.HTTP_405_METHOD_NOT_ALLOWED), request, response)
        return null
      }
      case RouteRetrieval.NOT_FOUND: {
        const e = this.errorHandler.HTTP_404_NOT_FOUND || this.errorHandler.DEFAULT
        e(new HTTPException(Status.HTTP_404_NOT_FOUND), request, response)
        return null
      }
      case RouteRetrieval.OK:
        return routeLookup
    }
  }

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
    run(request: Request, response: Response): void {
      if (pipeline.length === 0) {
        return route.executor(request, response)
      }

      let index = 0
      const t = (request1: Request, response1: Response) => {
        index += 1
        if (index >= pipeline.length) return route.executor(request1, response1)
        executeMiddleware(pipeline[index], request1, response1, t)
      }
      executeMiddleware(pipeline[index], request, response, t)
    },
  }
}

const executeMiddleware = (
  middleware: MiddlewareRepresentation,
  request: Request,
  response: Response,
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
