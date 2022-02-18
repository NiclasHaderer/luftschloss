import { HttpMiddlewareInterceptor } from "../core/interfaces/middleware"

export const corsMiddleware = (): HttpMiddlewareInterceptor => {
  return (next, request, response) => {
    // TODO implement
    next(request, response)
  }
}
