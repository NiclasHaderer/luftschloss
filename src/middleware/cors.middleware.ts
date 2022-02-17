import { HttpMiddlewareInterceptor } from "../core/types/middleware"

export const corsMiddleware = (): HttpMiddlewareInterceptor => {
  return (next, request, response) => {
    // TODO implement
    next(request, response)
  }
}
