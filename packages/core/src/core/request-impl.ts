import { IncomingMessage } from "http"
import { HTTP_METHODS } from "./route-collector.model"
import { URL } from "url"
import { normalizePath } from "./utils"
import { AddressInfo } from "net"
import { TLSSocket } from "tls"
import { Request } from "./request"

export class RequestImpl<T extends object = any, P extends object = any> implements Request<T, P> {
  private _data = {} as T
  private _pathParams = {} as P

  constructor(private readonly req: IncomingMessage) {}

  get data(): T {
    // TODO this is not correct
    return this._data
  }

  get raw(): IncomingMessage {
    return this.req
  }

  get parameters(): URLSearchParams {
    return this.url.searchParams
  }

  get pathParams(): P {
    return this._pathParams
  }

  set pathParams(params: P) {
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
