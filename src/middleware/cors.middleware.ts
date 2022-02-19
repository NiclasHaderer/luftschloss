import { HttpMiddlewareInterceptor } from "./middleware"

export const corsMiddleware = (): HttpMiddlewareInterceptor => {
  return (next, request, response) => {
    // TODO implement
    next(request, response)
  }
}
