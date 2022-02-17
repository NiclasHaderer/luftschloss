import { IncomingMessage as In, ServerResponse as Out } from "http"
import { Subject } from "rxjs"
import { EventData } from "../types/server"
import { RequestImpl } from "./request"
import { ReadonlyRoutingController, RouteRetrieval, SuccessfulRouteLookupResult } from "../types/routing-controller"
import { ErrorHandler } from "../types/error-handler"
import { HTTPException } from "./http-exception"
import { Status } from "./status"
import { Request } from "../types/request"
import { ResponseImpl } from "./response"
import { Response } from "../types/response"

export class RequestPipeline {
  /* tslint:disable:member-ordering */
  private readonly _handleEnd$ = new Subject<EventData>()
  private readonly _handleStart$ = new Subject<EventData>()

  public readonly handleEnd$ = this._handleEnd$.asObservable()
  public readonly handleStart$ = this._handleStart$.asObservable()

  /* tslint:enable:member-ordering */

  constructor(private routingController: ReadonlyRoutingController, private errorHandler: ErrorHandler) {
  }

  public queue = async (req: In, res: Out) =>
    // Add request start and end handling
    this.withStart(async () => {
      // Wrap the node request in own
      const request = new RequestImpl(req)
      const response = new ResponseImpl(res)

      await catchErrors(this.errorHandler, { request, response }, async () => {
        // Get the request handler for a certain url
        const requestExecutor = this.routingController.retrieve(request.url, request.method)
        switch (requestExecutor.type) {
          case RouteRetrieval.METHOD_NOT_ALLOWED:
            throw new HTTPException(Status.HTTP_405_METHOD_NOT_ALLOWED)
          case RouteRetrieval.NOT_FOUND:
            throw new HTTPException(Status.HTTP_404_NOT_FOUND)
          case RouteRetrieval.OK:
            break
        }
        const executionChain = buildExecutionChain(requestExecutor)
        await executionChain.run(request, response)
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

const catchErrors = async (errorHandlers: ErrorHandler, {
  request,
  response
}: { request: Request, response: Response }, callback: () => Promise<void>) => {
  try {
    await callback()
  } catch (e) {
    if (!(e instanceof HTTPException)) {
      e = HTTPException.wrap(e as Error, Status.HTTP_500_INTERNAL_SERVER_ERROR)
    }
    const error = e as HTTPException

    if (error.status.key in errorHandlers) {
      errorHandlers[error.status.key]!(error, request, response)
    } else {
      errorHandlers.DEFAULT(error, request, response)
    }
  }
}

const buildExecutionChain = (route: SuccessfulRouteLookupResult) => {
  return {
    run(request: Request, response: Response): void {
      // TODO add the middleware execution
      // TODO build the chains after the server was started to improve performance
      route.executor(request, response)
    }
  }

}
