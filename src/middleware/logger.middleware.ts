import { MiddleWareInterceptor, NextFunction } from "./middleware"
import { RequestImpl } from "../core/request"
import { ResponseImpl } from "../core/response"

const LoggerMiddleware = async (next: NextFunction, request: RequestImpl, response: ResponseImpl) => {
  const startTime = Date.now()
  await next(request, response)
  console.log(
    `${new Date().toISOString()} - ${request.method}-${response.getStatus().code}: ${request.url} took ${
      Date.now() - startTime
    }ms`
  )
}

export const loggerMiddleware = (): MiddleWareInterceptor => LoggerMiddleware
