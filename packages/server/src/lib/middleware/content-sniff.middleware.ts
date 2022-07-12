/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { LRequest, LResponse } from "../core"
import { NextFunction } from "./middleware"

const NoContentSniffMiddleware = async (next: NextFunction, request: LRequest, response: LResponse) => {
  await next(request, response)
  response.headers.append("X-Content-Type-Options", "nosniff")
}

export const noContentSniff = () => NoContentSniffMiddleware
