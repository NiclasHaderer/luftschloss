import { ErrorHandler } from "../types/error-handler"
import { Request } from "../types/request"
import { HTTPException } from "./http-exception"
import { Response } from "../types/response"

export const defaultErrorHandler: ErrorHandler = {
  DEFAULT(error: HTTPException, request: Request, response: Response): Promise<void> | void {
    response.status(error.status).json({ error: error.message })
  },
  HTTP_500_INTERNAL_SERVER_ERROR(error: HTTPException, request: Request, response: Response): Promise<void> | void {
    response.status(error.status).json({ error: error.message, trace: error.stack })
  },
}
