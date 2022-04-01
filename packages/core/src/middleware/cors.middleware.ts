import { HttpMiddlewareInterceptor } from "./middleware"

export const corsMiddleware = (): HttpMiddlewareInterceptor => {
  return async (next, request, response) => {
    // TODO
    await next(request, response)
  }
}
