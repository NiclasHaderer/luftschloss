import { MiddleWareInterceptor, NextFunction } from "./middleware"
import { Request, Response } from "../core"

const LoggerMiddleware = async (next: NextFunction, request: Request, response: Response): Promise<void> => {
  const startTime = Date.now()
  await next(request, response)
  console.log(
    `${new Date().toISOString()} - ${response.getStatus().code} ${request.method}: ${request.url.toString()} took ${
      Date.now() - startTime
    }ms`
  )
}

export const loggerMiddleware = (): MiddleWareInterceptor => LoggerMiddleware
