import { MiddleWareInterceptor, NextFunction } from "./middleware"
import { Request } from "../core/request"
import { Response } from "../core/response"

const LoggerMiddleware = async (next: NextFunction, request: Request, response: Response) => {
  const startTime = Date.now()
  await next(request, response)
  console.log(
    `${new Date().toISOString()} - ${request.method}-${response.getStatus().code}: ${request.url} took ${
      Date.now() - startTime
    }ms`
  )
}

export const loggerMiddleware = (): MiddleWareInterceptor => LoggerMiddleware
