import { ErrorHandler } from "../core/error-handler"
import { Status } from "../core/status"
import { HttpMiddlewareInterceptor, NextFunction } from "./middleware"
import { HTTPException } from "../core/http-exception"
import { Request } from "../core/request"
import { Response } from "../core/response"

export const errorMiddleware = (errorHandlers: ErrorHandler): HttpMiddlewareInterceptor => {
  const ErrorMiddleware = async (next: NextFunction, request: Request, response: Response) => {
    try {
      await next(request, response)
    } catch (e) {
      if (!(e instanceof HTTPException)) {
        console.error(e)
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
  return ErrorMiddleware
}
