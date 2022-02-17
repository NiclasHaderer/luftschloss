import { MiddleWareInterceptor } from "../core/types/middleware"

export const loggerMiddleware = (): MiddleWareInterceptor => {
  return async (next, request, response) => {
    const startTime = Date.now()
    await next(request, response)
    console.log(`${new Date().toISOString()} - ${request.url}: ${request.method} took ${Date.now() - startTime}`)
  }
}
