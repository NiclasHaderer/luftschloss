/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { Middleware } from "./middleware"

export const loggerMiddleware = (): Middleware => ({
  name: "logger",
  version: "1.0.0",
  handle: async (next, request, response) => {
    const startTime = Date.now()
    await next(request, response)
    console.log(
      `${new Date().toISOString()} - ${response.getStatus().code} ${request.method}: ${request.url.toString()} took ${
        Date.now() - startTime
      }ms`
    )
  },
})
