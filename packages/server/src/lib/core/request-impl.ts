/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import {
  ByLazy,
  Cache,
  ContentType,
  ContentTypeString,
  getBodyData,
  Headers,
  parseContentType,
  satisfiesContentLength,
  saveObject,
  UTF8SearchParams,
  UTF8Url,
} from "@luftschloss/common";
import {IncomingMessage} from "http";
import {AddressInfo} from "net";
import * as tls from "tls";
import {LRequest} from "./request";
import {HTTP_METHODS} from "./route-collector.model";
import {HTTPException} from "./http-exception";
import {Status} from "./status";

export class RequestImpl<DATA extends Record<string, unknown> = never> implements LRequest<DATA> {
  @ByLazy<UTF8SearchParams, RequestImpl<DATA>>(self => self.url.searchParams)
  public readonly urlParams!: UTF8SearchParams;
  @ByLazy<DATA, RequestImpl<DATA>>(() => saveObject<DATA>())
  public readonly data!: DATA;
  @ByLazy<Headers, RequestImpl<DATA>>(self => Headers.create(self.req.headers))
  public readonly headers!: Headers;
  @ByLazy<string, RequestImpl<DATA>>(self => self.url.pathname)
  public readonly path!: string;
  @ByLazy<UTF8Url, RequestImpl<DATA>>(self => {
    // Optional chaining is necessary because the mock socket does not have this method
    const { port, address } = (self.req.socket.address?.() as AddressInfo) || { port: 0, address: "0.0.0.0" };
    let protocol = "http://";
    if (self.req.socket instanceof tls.TLSSocket && self.req.socket.encrypted) {
      protocol = "https://";
    }

    return new UTF8Url(`${protocol}${address}:${port}${self.req.url!}`);
  })
  public readonly url!: UTF8Url;
  @ByLazy<ContentType, RequestImpl<DATA>>(self => {
    const contentType = self.headers.get("content-type");
    if (contentType) {
      return parseContentType(contentType);
    } else {
      return {
        type: undefined,
        parameters: {},
        encoding: undefined,
        matches: (contentType: string) => contentType === "*/*",
      };
    }
  })
  public readonly contentType!: ContentType;
  private _pathParams!: object;

  public constructor(private readonly req: IncomingMessage) {}

  public get raw(): IncomingMessage {
    return this.req;
  }

  public get method(): HTTP_METHODS {
    return this.req.method as HTTP_METHODS;
  }

  public pathParams<T extends object>(): T {
    return this._pathParams as T;
  }

  @Cache()
  public async buffer(maxBodySize?: number): Promise<Buffer> {
    maxBodySize = maxBodySize ?? 1024 * 1024;
    if (!satisfiesContentLength(this.headers, maxBodySize)) {
      throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Body is too big");
    }
    return getBodyData(this.req, maxBodySize).then(({ success, data }) => {
      if (!success) throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Body is too big");
      return data;
    });
  }

  public json<T extends object>(contentType: ContentTypeString = "application/json", maxBodySize?: number): Promise<T> {
    if (!this.contentType.matches(contentType)) {
      throw new Error(`Wrong content type: Required ${contentType}, got ${this.contentType.type}`);
    }
    return this.text("*/*", maxBodySize).then(text => JSON.parse(text));
  }

  public form<T extends Record<string, string[]> = Record<string, string[]>>(
    contentType: ContentTypeString = "application/x-www-form-urlencoded",
    maxBodySize?: number
  ): Promise<UTF8SearchParams<T>> {
    if (!this.contentType.matches(contentType)) {
      throw new Error(`Wrong content type: Required ${contentType}, got ${this.contentType.type}`);
    }
    return this.text("*/*", maxBodySize).then(text => new UTF8SearchParams<T>(text));
  }

  public text(contentType: ContentTypeString = "text/*", maxBodySize?: number): Promise<string> {
    if (!this.contentType.matches(contentType)) {
      throw new Error(`Wrong content type: Required ${contentType}, got ${this.contentType.type}`);
    }
    return this.buffer(maxBodySize).then(buffer => buffer.toString(this.contentType.encoding));
  }

  /**
   * @internal
   */
  public setPathParams(value: object) {
    this._pathParams = value;
  }
}
