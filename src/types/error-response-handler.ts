import { HTTP_HANDLER } from "./http"
import { ServerError } from "../impl/server-error"
import { Request } from "./request"

export interface ErrorResponseHandler {
  INTERNAL_ERROR: (error: Error, request: Request) => void | Promise<void>
  METHOD_NOT_ALLOWED: HTTP_HANDLER
  NOT_FOUND: HTTP_HANDLER
  SERVER_ERROR: (error: ServerError, request: Request) => void | Promise<void>
}
