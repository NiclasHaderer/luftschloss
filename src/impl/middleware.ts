// tslint:disable:max-line-length

import { Middleware, MiddlewareRepresentation, MiddlewareType } from "../types/middleware"
import { OperatorFunction } from "rxjs"
import { Request } from "../types/request"

export class MiddlewareImpl implements Middleware {
  public [Symbol.iterator] = (() => {
    const self = this
    return function* (): Generator<MiddlewareRepresentation, void, undefined> {
      yield* self.operations
    }
  })()
  private readonly operations: MiddlewareRepresentation[] = []

  public chain(...operations: OperatorFunction<any, any>[]): void {
    this.operations.push({ type: MiddlewareType.RX, rep: operations })
  }

  public pipe(callback: (request: Request) => void | Promise<void>): this {
    this.operations.push({ type: MiddlewareType.HTTP, rep: callback })
    return this
  }
}
