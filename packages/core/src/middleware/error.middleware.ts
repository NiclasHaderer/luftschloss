import { ErrorHandler, HTTPException, Request, Response, Status } from "../core"
import { HttpMiddlewareInterceptor, NextFunction } from "./middleware"

interface MiddleWareScope {
  errorHandlers: ErrorHandler
}

async function ErrorMiddleware(
  this: MiddleWareScope,
  next: NextFunction,
  request: Request,
  response: Response
): Promise<void> {
  try {
    await next(request, response)
  } catch (e) {
    if (!(e instanceof HTTPException)) {
      console.error(e)
      e = HTTPException.wrap(e as Error, Status.HTTP_500_INTERNAL_SERVER_ERROR)
    }
    const error = e as HTTPException

    const statusHandler = this.errorHandlers[error.status.key]
    if (statusHandler) {
      await statusHandler(error, request, response)
    } else {
      await this.errorHandlers.DEFAULT(error, request, response)
    }
  }
}

export const errorMiddleware = (errorHandlers: ErrorHandler): HttpMiddlewareInterceptor =>
  ErrorMiddleware.bind({ errorHandlers })
