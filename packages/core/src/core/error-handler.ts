import { HTTPException } from "./http-exception"
import { Status } from "./status"
import { Request } from "./request"
import { Response } from "./response"

type ErrorHandlerCallback = (error: HTTPException, request: Request, response: Response) => void | Promise<void>

/**
 * The ErrorHandler Interface consists of a partial list of all HTTP_STATUSES and a default handler which will get
 * executed in case there is no handler for a certain status
 */
export type ErrorHandler = Partial<{
  [STATUS in keyof typeof Status]: ErrorHandlerCallback
}> & { DEFAULT: ErrorHandlerCallback }

export const defaultErrorHandler: ErrorHandler = {
  DEFAULT(error: HTTPException, request: Request, response: Response): Promise<void> | void {
    response.status(error.status).json({ error: error.message })
  },
  HTTP_500_INTERNAL_SERVER_ERROR(error: HTTPException, request: Request, response: Response): Promise<void> | void {
    // TODO check if running in prod and if not don't send the internal server message out
    response.status(error.status).json({ error: error.message, trace: error.stack })
  },
}
