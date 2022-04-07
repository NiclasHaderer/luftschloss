/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { IncomingMessage } from "http"
import { HTTP_METHODS } from "./route-collector.model"
import { normalizePath, saveObject } from "./utils"
import { AddressInfo } from "net"
import * as tls from "tls"
import { Request } from "./request"
import { Headers } from "./headers"
import { ByLazy } from "./by-lazy"
import { UTF8Url } from "./utf8-url"
import { Utf8SearchParams } from "./utf8-search-params"

export class RequestImpl<P extends object = any, T extends Record<string, unknown> = any> implements Request<P, T> {
  private _pathParams = saveObject() as P

  public constructor(private readonly req: IncomingMessage) {}

  @ByLazy<T, RequestImpl>(() => saveObject<T>())
  public readonly data!: T

  @ByLazy<Headers, RequestImpl>(self => Headers.create(self.req.headers))
  public readonly headers!: Headers

  @ByLazy<Utf8SearchParams, RequestImpl>(self => self.url.searchParams)
  public readonly urlParams!: Utf8SearchParams

  @ByLazy<string, RequestImpl>(self => decodeURIComponent(self.url.pathname))
  public readonly path!: string

  @ByLazy<UTF8Url, RequestImpl>(self => {
    const { port, address } = self.req.socket.address() as AddressInfo
    let protocol = "http://"
    if (self.req.socket instanceof tls.TLSSocket && self.req.socket.encrypted) {
      protocol = "https://"
    }

    return new UTF8Url(`${protocol}${address}:${port}${normalizePath(self.req.url!)}`)
  })
  public readonly url!: UTF8Url

  public get raw(): IncomingMessage {
    return this.req
  }

  public get pathParams(): P {
    return this._pathParams
  }

  public set pathParams(value: P) {
    this._pathParams = value
  }

  public get method(): HTTP_METHODS {
    return this.req.method as HTTP_METHODS
  }
}
