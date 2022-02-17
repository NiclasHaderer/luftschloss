import { ErrorResponseHandler } from "../types/error-response-handler"
import { Request } from "../types/request"
import { HTTPException } from "./http-exception"

export const defaultErrorHandler: ErrorResponseHandler = {
  DEFAULT(error: HTTPException, request: Request): Promise<void> | void {
    request.respondJson(error.status.code, { error: error.message })
  },
  HTTP_500_INTERNAL_SERVER_ERROR(error: HTTPException, request: Request): Promise<void> | void {
    request.respondJson(error.status.code, { error: error.message, trace: error.stack })
  },
}
