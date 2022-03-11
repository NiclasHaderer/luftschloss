import { IncomingMessage } from "http"
import { HTTP_METHODS } from "./route-collector.model"
import { normalizePath } from "./utils"

export class RequestImpl<
  T extends Record<string, any> | unknown = unknown,
  P extends Record<string, any> = Record<string, unknown>
> {
  private _completed = false
  private _data = {} as T
  private _pathParams = {} as P

  constructor(private readonly req: IncomingMessage, private readonly port: number) {}

  get completed(): boolean {
    return this._completed
  }

  get data(): T {
    return this._data
  }

  get parameters(): URLSearchParams {
    return this.url.searchParams
  }

  get pathParams(): P {
    return this._pathParams
  }

  /**
   * @deprecated Internal use only
   */
  public _setPathParams(params: P): void {
    this._pathParams = params
  }

  get path(): string {
    return this.url.pathname
  }

  get method(): HTTP_METHODS {
    return this.req.method as HTTP_METHODS
  }

  get url(): URL {
    // TODO http or https
    return new URL(`http://0.0.0.0:${this.port}${normalizePath(this.req.url!)}`)
  }
}
