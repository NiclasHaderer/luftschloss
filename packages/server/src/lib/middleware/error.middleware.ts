/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { ErrorHandler, HTTPException, LRequest, LResponse, Status } from "../core"
import { Middleware, NextFunction } from "./middleware"

export const errorMiddleware = (errorHandlers: ErrorHandler): Middleware => {
  return {
    name: "error",
    version: "1.0.0",
    handle: async (next: NextFunction, request: LRequest, response: LResponse) => {
      try {
        await next(request, response)
      } catch (e) {
        if (!(e instanceof HTTPException)) {
          console.trace("Error caught in middleware", e)
          //eslint-disable-next-line no-ex-assign
          e = HTTPException.wrap(e as Error, Status.HTTP_500_INTERNAL_SERVER_ERROR)
        }
        const error = e as HTTPException

        const statusHandler = errorHandlers[error.status.key]
        if (statusHandler) {
          await statusHandler(error, request, response)
        } else {
          await errorHandlers.DEFAULT(error, request, response)
        }
      }
    },
  }
}
