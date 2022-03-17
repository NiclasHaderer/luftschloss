import { IncomingMessage as In, ServerResponse as Out } from "http"
import { Subject } from "./subject"
import { RequestImpl } from "./request-impl"
import { HTTP_METHODS, LookupResultStatus, ROUTE_HANDLER, RouteLookupResult } from "./route-collector.model"
import { ResponseImpl } from "./response-impl"
import { Status } from "./status"
import { HTTPException } from "./http-exception"
import { MiddlewareRepresentation, MiddlewareType, NextFunction, ReadonlyMiddlewares } from "../middleware/middleware"
import { EventData } from "./server"
import { MergedRoutes } from "./router-merger"
import { resolveRoute } from "./resolve-route"
import { Request } from "./request"
import { Response } from "./response"

export class RequestPipeline {
  private readonly _handleEnd$ = new Subject<EventData>()
  private readonly _handleStart$ = new Subject<EventData>()
  public readonly handleEnd$ = this._handleEnd$.asObservable()
  public readonly handleStart$ = this._handleStart$.asObservable()
  private locked = false
  private routes!: Readonly<MergedRoutes>

  constructor(private mandatoryMiddleware: ReadonlyMiddlewares) {}

  public async queue(req: In, res: Out): Promise<void> {
    if (!this.locked) throw new Error("RequestPipeline has not been locked. You have to lock it in order to use it")

    // Add request start and end handling
    return this.withStart(async () => {
      // Wrap the node request/response in own implementation
      const request = new RequestImpl(req)
      const response = new ResponseImpl(res)

      // Get the request handler for a certain url
      const route = resolveRoute(request.path, request.method, this.routes)

      // Set the extracted path params in the request instance
      request.pathParams = route.pathParams || {}

      // Get a successful result and if an executor could not be resolved wrap it in a default not found executor or
      // method not allowed executor
      const requestExecutor = this.retrieveExecutor(route, request.method)

      // Create chain which will run the middleware and the callback
      const executionChain = buildMiddlewareExecutionChain(requestExecutor)
      await executionChain.run(request, response)
    })
  }

  /**
   * Unwrap the routeLookup and handle the case that a handler was not found, or the wrong method was used
   */
  private retrieveExecutor(
    routeLookup: RouteLookupResult,
    method: HTTP_METHODS
  ): { executor: ROUTE_HANDLER; pipeline: Iterable<MiddlewareRepresentation> } {
    // Send default options response
    if (method === "OPTIONS" && routeLookup.status !== LookupResultStatus.OK) {
      return {
        executor: (request, response) => {
          response.status(Status.HTTP_204_NO_CONTENT).header("Allow", routeLookup.availableMethods.join(", "))
        },
        pipeline: this.mandatoryMiddleware,
      }
    }

    switch (routeLookup.status) {
      case LookupResultStatus.METHOD_NOT_ALLOWED: {
        return {
          executor: () => {
            throw new HTTPException(Status.HTTP_405_METHOD_NOT_ALLOWED)
          },
          pipeline: this.mandatoryMiddleware,
        }
      }
      case LookupResultStatus.NOT_FOUND: {
        return {
          executor: () => {
            throw new HTTPException(Status.HTTP_404_NOT_FOUND)
          },
          pipeline: this.mandatoryMiddleware,
        }
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

  public lock(entries: MergedRoutes): void {
    if (this.locked) throw new Error("Cannot lock the request pipeline a second time")
    this.locked = true
    this.routes = entries
  }
}

const buildMiddlewareExecutionChain = (route: {
  executor: ROUTE_HANDLER
  pipeline: Iterable<MiddlewareRepresentation>
}) => {
  const pipeline = [...route.pipeline]
  return {
    run(req: Request, res: Response): void {
      let index = -1
      const executionWrapper = (request: Request, response: Response) => {
        index += 1
        if (index >= pipeline.length) return route.executor(request, response)
        executeMiddleware(pipeline[index], executionWrapper, request, response)
      }
      executionWrapper(req, res)
    },
  }
}

const executeMiddleware = (
  middleware: MiddlewareRepresentation,
  next: NextFunction,
  request: Request,
  response: Response
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
