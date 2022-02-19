import { HTTPException } from "./http-exception"
import { Status } from "./status"
import { RequestImpl } from "./request"
import { ResponseImpl } from "./response"

type Handler = (error: HTTPException, request: RequestImpl, response: ResponseImpl) => void | Promise<void>

export type ErrorHandler = Partial<{
  [STATUS in keyof typeof Status]: Handler
}> & { DEFAULT: Handler }

export const defaultErrorHandler: ErrorHandler = {
  DEFAULT(error: HTTPException, request: RequestImpl, response: ResponseImpl): Promise<void> | void {
    response.status(error.status).json({ error: error.message })
  },
  HTTP_500_INTERNAL_SERVER_ERROR(
    error: HTTPException,
    request: RequestImpl,
    response: ResponseImpl
  ): Promise<void> | void {
    response.status(error.status).json({ error: error.message, trace: error.stack })
  },
}
