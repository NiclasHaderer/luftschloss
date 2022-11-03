/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { LRequest, LResponse } from "../core"
import { Middleware, NextFunction } from "./middleware"

export const noContentSniff = (): Middleware => ({
  name: "no-content-sniff",
  version: "1.0.0",
  handle: async (next: NextFunction, request: LRequest, response: LResponse) => {
    response.headers.append("X-Content-Type-Options", "nosniff")
    await next(request, response)
  },
})
