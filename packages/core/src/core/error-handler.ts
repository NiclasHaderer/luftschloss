import { HTTPException } from "./http-exception"
import { Status } from "./status"
import { RequestImpl } from "./request"
import { ResponseImpl } from "./response"

type ErrorHandlerCallback = (error: HTTPException, request: RequestImpl, response: ResponseImpl) => void | Promise<void>

/**
 * The ErrorHandler Interface consists of a partial list of all HTTP_STATUSES and a default handler which will get
 * executed in case there is no handler for a certain status
 */
export type ErrorHandler = Partial<{
  [STATUS in keyof typeof Status]: ErrorHandlerCallback
}> & { DEFAULT: ErrorHandlerCallback }

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
