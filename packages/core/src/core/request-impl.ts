import { IncomingMessage } from "http"
import { HTTP_METHODS } from "./route-collector.model"
import { URL } from "url"
import { normalizePath, saveObject } from "./utils"
import { AddressInfo } from "net"
import { TLSSocket } from "tls"
import { Request } from "./request"
import { Headers } from "./headers"

export class RequestImpl<P extends object = any, T extends object = any> implements Request<P, T> {
  private _data = saveObject() as T
  private _pathParams = saveObject() as P

  public constructor(private readonly req: IncomingMessage) {}

  public get data(): T {
    // TODO this is not correct
    return this._data
  }

  public get raw(): IncomingMessage {
    return this.req
  }

  public get headers(): Headers {
    return Headers.create(this.req.headers)
  }

  public get parameters(): URLSearchParams {
    return this.url.searchParams
  }

  public get pathParams(): P {
    return this._pathParams
  }

  public set pathParams(params: P) {
    this._pathParams = params
  }

  public get path(): string {
    return this.url.pathname
  }

  public get method(): HTTP_METHODS {
    return this.req.method as HTTP_METHODS
  }

  public get url(): URL {
    const { port, address } = this.req.socket.address() as AddressInfo
    let protocol = "http://"
    if ("encrypted" in this.req.socket && (this.req.socket as TLSSocket).encrypted) {
      protocol = "https://"
    }
    return new URL(`${protocol}${address}:${port}${normalizePath(this.req.url!)}`)
  }
}
