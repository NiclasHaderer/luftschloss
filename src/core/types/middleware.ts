// tslint:disable:max-line-length
import { OperatorFunction } from "rxjs"
import { Request } from "./request"

export enum MiddlewareType {
  RX,
  HTTP,
  CLASS,
}

export type MiddlewareRepresentation =
  | {
      rep: HttpMiddlewareInterceptor
      type: MiddlewareType.HTTP
    }
  | {
      rep: RxMiddlewareInterceptor
      type: MiddlewareType.RX
    }
  | {
      rep: ClassMiddlewareInterceptor
      type: MiddlewareType.CLASS
    }

type NextFunction = (request: Request) => void | Promise<void>

export type RxMiddlewareInterceptor = OperatorFunction<any, any>[]
export type HttpMiddlewareInterceptor = (request: Request, next: NextFunction) => void | Promise<void>
export type ClassMiddlewareInterceptor = {
  handle(request: Request, next: NextFunction): void | Promise<void>
}
export type MiddleWareInterceptor = RxMiddlewareInterceptor | HttpMiddlewareInterceptor | ClassMiddlewareInterceptor

export const isRxMiddleware = (middleware: MiddleWareInterceptor): middleware is RxMiddlewareInterceptor => {
  return Array.isArray(middleware)
}

export const isHttpMiddleware = (middleware: MiddleWareInterceptor): middleware is HttpMiddlewareInterceptor => {
  return typeof middleware === "function"
}
export const isClassMiddleware = (middleware: MiddleWareInterceptor): middleware is ClassMiddlewareInterceptor => {
  return typeof middleware === "object" && !Array.isArray(middleware)
}

export type ReadonlyMiddleware = Iterable<MiddlewareRepresentation>

export interface Middleware extends ReadonlyMiddleware {
  chain<A>(op1: OperatorFunction<Request, A>): void

  chain<A, B>(op1: OperatorFunction<Request, A>, op2: OperatorFunction<A, B>): void

  chain<A, B, C>(op1: OperatorFunction<Request, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): void

  chain<A, B, C, D>(
    op1: OperatorFunction<Request, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>
  ): void

  chain<A, B, C, D, E>(
    op1: OperatorFunction<Request, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>
  ): void

  chain<A, B, C, D, E, F>(
    op1: OperatorFunction<Request, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>
  ): void

  chain<A, B, C, D, E, F, G>(
    op1: OperatorFunction<Request, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>
  ): void

  chain<A, B, C, D, E, F, G, H>(
    op1: OperatorFunction<Request, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>
  ): void

  chain<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<Request, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>
  ): void

  chain<A, B, C, D, E, F, G, H, I>(
    op1: OperatorFunction<Request, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>,
    ...operations: OperatorFunction<any, any>[]
  ): void

  pipe(callback: HttpMiddlewareInterceptor | ClassMiddlewareInterceptor): this
}
