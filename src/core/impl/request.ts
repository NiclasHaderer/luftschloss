import { Request } from "../types/request"
import { IncomingMessage, ServerResponse } from "http"
import { HTTP_METHODS } from "../types/http"

export class RequestImpl<T extends Record<string, any> | unknown = unknown> implements Request<T> {
  private _completed = false
  private _data = {} as T

  constructor(public readonly req: IncomingMessage, public readonly res: ServerResponse) {}

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

  public respondBytes(status: number, byte: Buffer): void {
    this._completed = true
    // TODO this.res.writeHead(status,)
  }

  public respondJson(status: number, object: any): void {
    this._completed = true
    this.res.writeHead(status, { "Content-Type": "application/json" })
    this.res.end(JSON.stringify(object))
  }

  public respondText(status: number, text: string): void {
    this._completed = true
    this.res.writeHead(status, { "Content-Type": "text/plain" })
    this.res.end(text)
  }
}
