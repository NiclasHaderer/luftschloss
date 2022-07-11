/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { LRequest, LResponse } from "../core"
import { MiddleWareInterceptor, NextFunction } from "./middleware"

const LoggerMiddleware = async (next: NextFunction, request: LRequest, response: LResponse): Promise<void> => {
  const startTime = Date.now()
  await next(request, response)
  console.log(
    `${new Date().toISOString()} - ${response.getStatus().code} ${request.method}: ${request.url.toString()} took ${
      Date.now() - startTime
    }ms`
  )
}

export const loggerMiddleware = (): MiddleWareInterceptor => LoggerMiddleware
