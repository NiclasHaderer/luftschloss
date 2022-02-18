// tslint:disable:max-line-length
import { Request } from "./request"
import { Response } from "./response"

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

export type NextFunction = (request: Request, response: Response) => void | Promise<void>

export type HttpMiddlewareInterceptor = (
  next: NextFunction,
  request: Request,
  response: Response
) => void | Promise<void>
export type ClassMiddlewareInterceptor = {
  handle(next: NextFunction, request: Request, response: Response): void | Promise<void>
}
export type MiddleWareInterceptor = HttpMiddlewareInterceptor | ClassMiddlewareInterceptor

export const isHttpMiddleware = (middleware: MiddleWareInterceptor): middleware is HttpMiddlewareInterceptor => {
  return typeof middleware === "function"
}
export const isClassMiddleware = (middleware: MiddleWareInterceptor): middleware is ClassMiddlewareInterceptor => {
  return typeof middleware === "object" && !Array.isArray(middleware)
}
