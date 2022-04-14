/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { Request, Response } from "../core"
import { NextFunction } from "./middleware"

const PoweredByMiddleware = async (next: NextFunction, request: Request, response: Response) => {
  await next(request, response)
  response.headers.append("X-Powered-By", "luftschloss")
}

export const poweredBy = () => PoweredByMiddleware
