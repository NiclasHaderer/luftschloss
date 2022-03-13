import { IncomingMessage } from "http"
import { HTTP_METHODS } from "./route-collector.model"
import { URL } from "url"
import { normalizePath } from "./utils"
import { AddressInfo } from "net"
import { TLSSocket } from "tls"

// TODO hide non public methods behind an interface

export class RequestImpl<
  T extends Record<string, any> | unknown = unknown,
  P extends Record<string, any> = Record<string, unknown>
> {
  private _completed = false
  private _data = {} as T
  private _pathParams = {} as P

  constructor(private readonly req: IncomingMessage) {}

  get completed(): boolean {
    return this._completed
  }

  get data(): T {
    // TODO this is not correct
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
    const { port, address } = this.req.socket.address() as AddressInfo
    let protocol = "http://"
    if ("encrypted" in this.req.socket && (this.req.socket as TLSSocket).encrypted) {
      protocol = "https://"
    }
    return new URL(`${protocol}${address}:${port}${normalizePath(this.req.url!)}`)
  }
}
