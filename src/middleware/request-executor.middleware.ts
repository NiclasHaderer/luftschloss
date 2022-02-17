import { HttpMiddlewareInterceptor } from "../core/types/middleware"

export const RequestExecutorMiddleware: HttpMiddlewareInterceptor = (next, request, response) => next(request, response)
