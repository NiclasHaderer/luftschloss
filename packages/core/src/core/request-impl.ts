/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { IncomingMessage } from "http"
import { AddressInfo } from "net"
import * as tls from "tls"
import { ByLazy } from "./by-lazy"
import { Headers } from "./headers"
import { LRequest } from "./request"
import { HTTP_METHODS } from "./route-collector.model"
import { UTF8SearchParams } from "./utf8-search-params"
import { UTF8Url } from "./utf8-url"
import { normalizePath, saveObject } from "./utils"

export class RequestImpl<DATA extends Record<string, unknown> = never> implements LRequest<DATA> {
  private _pathParams!: object

  public constructor(private readonly req: IncomingMessage) {}

  @ByLazy<UTF8SearchParams, RequestImpl<DATA>>(self => self.url.searchParams)
  public readonly urlParams!: UTF8SearchParams

  @ByLazy<DATA, RequestImpl<DATA>>(() => saveObject<DATA>())
  public readonly data!: DATA

  @ByLazy<Headers, RequestImpl<DATA>>(self => Headers.create(self.req.headers))
  public readonly headers!: Headers

  @ByLazy<string, RequestImpl<DATA>>(self => decodeURIComponent(self.url.pathname))
  public readonly path!: string

  @ByLazy<UTF8Url, RequestImpl<DATA>>(self => {
    // Optional chaning is necessary because the mock socket does not have this method
    const { port, address } = (self.req.socket.address?.() as AddressInfo) || { port: 1234, address: "0.0.0.0" }
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

  public pathParams<T extends object>(): T {
    return this._pathParams as T
  }

  public setPathParams(value: object) {
    this._pathParams = value
  }

  public get method(): HTTP_METHODS {
    return this.req.method as HTTP_METHODS
  }
}
