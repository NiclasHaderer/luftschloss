import { MiddleWareInterceptor, NextFunction } from "../core/interfaces/middleware"
import { Request } from "ts-server/core/interfaces/request"
import { Response } from "ts-server/core/interfaces/response"

const LoggerMiddleware = async (next: NextFunction, request: Request, response: Response) => {
  const startTime = Date.now()
  await next(request, response)
  console.log(`${new Date().toISOString()} - ${request.method}:${request.url} took ${Date.now() - startTime}ms`)
}

export const loggerMiddleware = (): MiddleWareInterceptor => LoggerMiddleware
