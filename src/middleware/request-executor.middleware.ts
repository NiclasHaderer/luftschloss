import { HttpMiddlewareInterceptor } from "../core/types/middleware"

export const RequestExecutorMiddleware: HttpMiddlewareInterceptor = (request, next) => next(request)
