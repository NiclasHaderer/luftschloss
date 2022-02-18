import { ErrorHandler } from "../interfaces/error-handler"
import { Request } from "../interfaces/request"
import { HTTPException } from "./http-exception"
import { Response } from "../interfaces/response"

export const defaultErrorHandler: ErrorHandler = {
  DEFAULT(error: HTTPException, request: Request, response: Response): Promise<void> | void {
    response.status(error.status).json({ error: error.message })
  },
  HTTP_500_INTERNAL_SERVER_ERROR(error: HTTPException, request: Request, response: Response): Promise<void> | void {
    response.status(error.status).json({ error: error.message, trace: error.stack })
  },
}
