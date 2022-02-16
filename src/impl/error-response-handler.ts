import { ErrorResponseHandler } from "../types/error-response-handler"
import { Request } from "../types/request"
import { ServerError } from "./server-error"

export const defaultErrorHandler: ErrorResponseHandler = {
  INTERNAL_ERROR(error: Error, request: Request): Promise<void> | void {
    request.respondJson(500, { error: `Internal error: ${error.message}`, stack: error.stack })
  },
  SERVER_ERROR({ message, status }: ServerError, request: Request): Promise<void> | void {
    request.respondJson(status, { error: message })
  },
  NOT_FOUND(request: Request): Promise<void> | void {
    request.respondJson(404, { error: "Page not found" })
  },
  METHOD_NOT_ALLOWED(request: Request): Promise<void> | void {
    request.respondJson(405, { error: "Method not allowed" })
  },
}
