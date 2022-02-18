import { HttpMiddlewareInterceptor } from "ts-server/core/interfaces/middleware"
import { HTTPException } from "ts-server/core/impl/http-exception"
import { Status } from "ts-server/core/impl/status"
import { ErrorHandler } from "ts-server/core/interfaces/error-handler"

export const errorMiddleware = (errorHandlers: ErrorHandler): HttpMiddlewareInterceptor => {
  return async (next, request, response) => {
    try {
      await next(request, response)
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
}
