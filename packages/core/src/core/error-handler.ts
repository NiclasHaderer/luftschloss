/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { HTTPException } from "./http-exception"
import { isProduction } from "./production"
import { LRequest } from "./request"
import { LResponse } from "./response"
import { Status } from "./status"

type ErrorHandlerCallback = (error: HTTPException, request: LRequest, response: LResponse) => void | Promise<void>

/**
 * The ErrorHandler Interface consists of a partial list of all HTTP_STATUSES and a default handler which will get
 * executed in case there is no handler for a certain status
 */
export type ErrorHandler = Partial<{
  [STATUS in keyof typeof Status]: ErrorHandlerCallback
}> & { DEFAULT: ErrorHandlerCallback } & { HTTP_500_INTERNAL_SERVER_ERROR: ErrorHandlerCallback }

export const defaultErrorHandler: ErrorHandler = {
  DEFAULT: (error: HTTPException, request: LRequest, response: LResponse): Promise<void> | void => {
    console.log(request.urlParams)
    response.status(error.status).json({ error: error.message })
  },
  HTTP_500_INTERNAL_SERVER_ERROR: (
    error: HTTPException,
    request: LRequest,
    response: LResponse
  ): Promise<void> | void => {
    if (isProduction()) {
      response.status(error.status).json({ error: error.message })
    } else {
      response.status(error.status).json({ error: error.message, trace: error.stack })
    }
  },
}
