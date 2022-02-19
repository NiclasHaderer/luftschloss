// tslint:disable:max-line-length

import { RequestImpl } from "../core/request"
import { ResponseImpl } from "../core/response"

export enum MiddlewareType {
  HTTP,
  CLASS,
}

export type MiddlewareRepresentation =
  | {
      rep: HttpMiddlewareInterceptor
      type: MiddlewareType.HTTP
    }
  | {
      rep: ClassMiddlewareInterceptor
      type: MiddlewareType.CLASS
    }

export type NextFunction = (request: RequestImpl, response: ResponseImpl) => void | Promise<void>

export type HttpMiddlewareInterceptor = (
  next: NextFunction,
  request: RequestImpl,
  response: ResponseImpl
) => void | Promise<void>
export type ClassMiddlewareInterceptor = {
  handle(next: NextFunction, request: RequestImpl, response: ResponseImpl): void | Promise<void>
}
export type MiddleWareInterceptor = HttpMiddlewareInterceptor | ClassMiddlewareInterceptor

export const isHttpMiddleware = (middleware: MiddleWareInterceptor): middleware is HttpMiddlewareInterceptor => {
  return typeof middleware === "function"
}
export const isClassMiddleware = (middleware: MiddleWareInterceptor): middleware is ClassMiddlewareInterceptor => {
  return typeof middleware === "object" && !Array.isArray(middleware)
}
