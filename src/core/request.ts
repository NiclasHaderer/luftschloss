import { IncomingMessage } from "http"
import { HTTP_METHODS } from "./route-collector.model"

export class RequestImpl<T extends Record<string, any> | unknown = unknown> {
  private _completed = false
  private _data = {} as T

  constructor(public readonly req: IncomingMessage) {}

  get completed(): boolean {
    return this._completed
  }

  get data(): T {
    return this._data
  }

  get method(): HTTP_METHODS {
    return this.req.method as HTTP_METHODS
  }

  get url(): string {
    return this.req.url as string
  }
}
