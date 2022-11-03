/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { LRequest, LResponse } from "../core"
import { Middleware, NextFunction } from "./middleware"

export const poweredBy = (): Middleware => ({
  name: "powered-by",
  version: "1.0.0",
  handle: async (next: NextFunction, request: LRequest, response: LResponse) => {
    response.headers.append("X-Powered-By", "luftschloss")
    await next(request, response)
  },
})
