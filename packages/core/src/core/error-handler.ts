/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { HTTPException } from "./http-exception"
import { Status } from "./status"
import { Request } from "./request"
import { Response } from "./response"
import { isProduction } from "./production"

type ErrorHandlerCallback = (error: HTTPException, request: Request, response: Response) => void | Promise<void>

/**
 * The ErrorHandler Interface consists of a partial list of all HTTP_STATUSES and a default handler which will get
 * executed in case there is no handler for a certain status
 */
export type ErrorHandler = Partial<{
  [STATUS in keyof typeof Status]: ErrorHandlerCallback
}> & { DEFAULT: ErrorHandlerCallback } & { HTTP_500_INTERNAL_SERVER_ERROR: ErrorHandlerCallback }

export const defaultErrorHandler: ErrorHandler = {
  DEFAULT: (error: HTTPException, request: Request, response: Response): Promise<void> | void => {
    console.log(request.urlParams)
    response.status(error.status).json({ error: error.message })
  },
  HTTP_500_INTERNAL_SERVER_ERROR: (
    error: HTTPException,
    request: Request,
    response: Response
  ): Promise<void> | void => {
    if (isProduction()) {
      response.status(error.status).json({ error: error.message })
    } else {
      response.status(error.status).json({ error: error.message, trace: error.stack })
    }
  },
}
