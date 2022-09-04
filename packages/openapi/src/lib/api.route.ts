/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { DeepPartial, GenericEventEmitter, normalizePath } from "@luftschloss/common"
import { Operation } from "@luftschloss/openapi-schema"
import {
  HTTP_METHODS,
  HTTPException,
  LRequest,
  LResponse,
  ROUTE_HANDLER,
  RouteCollector,
  Status,
} from "@luftschloss/server"
import {
  LuftArray,
  LuftInfer,
  LuftObject,
  LuftTuple,
  LuftType,
  LuftUnion,
  ValidationHook,
} from "@luftschloss/validation"
import { ApiRouter } from "./api.router"
/* eslint-disable @typescript-eslint/no-explicit-any */

export type OpenApiHandler<
  PATH extends LuftObject<any> | undefined,
  URL_PARAMS extends LuftObject<any> | undefined,
  BODY extends LuftObject<any> | undefined,
  HEADERS extends LuftObject<any> | undefined,
  RESPONSE extends LuftObject<any> | undefined
> = (args: {
  path: PATH extends LuftObject<any> ? LuftInfer<PATH> : undefined
  query: URL_PARAMS extends LuftObject<any> ? LuftInfer<URL_PARAMS> : undefined
  body: BODY extends LuftObject<any> ? LuftInfer<BODY> : undefined
  headers: HEADERS extends LuftObject<any> ? LuftInfer<HEADERS> : undefined
}) => RESPONSE extends LuftObject<any>
  ? LuftInfer<RESPONSE>
  : undefined | Promise<RESPONSE extends LuftObject<any> ? LuftInfer<RESPONSE> : undefined>

export interface RouterParams<
  PATH extends LuftObject<any> | undefined,
  URL_PARAMS extends LuftObject<any> | undefined,
  BODY extends LuftObject<any> | undefined,
  HEADERS extends LuftObject<any> | undefined,
  RESPONSE extends LuftObject<any> | undefined
> {
  path: PATH
  query: URL_PARAMS
  body: BODY
  headers: HEADERS
  response: RESPONSE
}

export type CollectedRoute<
  PATH extends LuftObject<Record<string, LuftType>> | undefined = LuftObject<Record<string, LuftType>> | undefined,
  QUERY extends LuftObject<Record<string, LuftType>> | undefined = LuftObject<Record<string, LuftType>> | undefined,
  BODY extends LuftObject<Record<string, LuftType>> | undefined = LuftObject<Record<string, LuftType>> | undefined,
  HEADERS extends LuftObject<Record<string, LuftType>> | undefined = LuftObject<Record<string, LuftType>> | undefined,
  RESPONSE extends LuftObject<Record<string, LuftType>> | undefined = LuftObject<Record<string, LuftType>> | undefined
> = {
  path: `/${string}`
  method: HTTP_METHODS
  validator: RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>
  info: DeepPartial<Operation>
}

export class ApiRoute<
  PATH extends LuftObject<any> | undefined,
  QUERY extends LuftObject<any> | undefined,
  BODY extends LuftObject<any> | undefined,
  HEADERS extends LuftObject<any> | undefined,
  RESPONSE extends LuftObject<any> | undefined
> extends GenericEventEmitter<{
  listenerAttached: CollectedRoute
}> {
  private infoObject?: DeepPartial<Operation>

  public constructor(
    private router: ApiRouter,
    private collector: RouteCollector,
    private validators: RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ) {
    super()
    this.validators.query = extractSingleElementFromList(this.validators.query)
    this.validators.headers = extractSingleElementFromList(this.validators.headers)
  }

  public info(info: DeepPartial<Operation>): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    this.infoObject = info
    return this
  }

  public handle<T extends HTTP_METHODS | HTTP_METHODS[] | "*">(
    method: T,
    path: string,
    callHandler: T extends "*"
      ? OpenApiHandler<PATH, QUERY, BODY | undefined, HEADERS, RESPONSE>
      : T extends "GET" | "HEAD"
      ? OpenApiHandler<PATH, QUERY, undefined, HEADERS, RESPONSE>
      : T[number] extends "GET" | "HEAD"
      ? OpenApiHandler<PATH, QUERY, undefined, HEADERS, RESPONSE>
      : "GET" extends T[number]
      ? OpenApiHandler<PATH, QUERY, undefined | BODY, HEADERS, RESPONSE>
      : "HEAD" extends T[number]
      ? OpenApiHandler<PATH, QUERY, undefined | BODY, HEADERS, RESPONSE>
      : OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    const methods: HTTP_METHODS[] = Array.isArray(method)
      ? method
      : method === "*"
      ? Object.values(HTTP_METHODS)
      : [method]
    for (const method of methods) {
      this.collector.add(
        path,
        method,
        this.wrapWithOpenApi(callHandler as OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>)
      )
      this.emit("listenerAttached", {
        path: normalizePath(path),
        info: this.infoObject ?? {},
        method: method,
        validator: this.validators,
      })
    }
    return this
  }

  public get(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, undefined, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("GET", url, callHandler)
  }

  public head(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, undefined, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("HEAD", url, callHandler)
  }

  public post(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("POST", url, callHandler)
  }

  public put(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("POST", url, callHandler)
  }

  public delete(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("DELETE", url, callHandler)
  }

  public options(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("OPTIONS", url, callHandler)
  }

  public trace(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("TRACE", url, callHandler)
  }

  public patch(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("PATCH", url, callHandler)
  }

  public all(
    url: string,
    callHandler: OpenApiHandler<PATH, QUERY, BODY | undefined, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("*", url, callHandler)
  }

  private wrapWithOpenApi(handler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>): ROUTE_HANDLER {
    return async (request: LRequest, response: LResponse): Promise<void> => {
      // Path
      const parsedPath = await parseAndError(this.validators.path, () => request.pathParams(), "path")

      // Query
      const parsedQuery = await parseAndError(this.validators.query, () => request.url.searchParams.encode(), "query")

      // Body
      const ignoreBody = request.method === "GET" || request.method === "HEAD"
      const parsedBody = await parseAndError<BODY>(
        ignoreBody ? (undefined as BODY) : this.validators.body,
        () => request.json(),
        "body"
      )

      // Headers
      const parsedHeaders = await parseAndError(this.validators.headers, () => request.headers.encode(), "headers")

      // Response
      const result = await handler({
        path: parsedPath,
        body: parsedBody,
        query: parsedQuery,
        headers: parsedHeaders,
      })

      const parsedResult = await parseAndError(
        this.validators.response,
        () => result,
        "response",
        Status.HTTP_500_INTERNAL_SERVER_ERROR
      )
      parsedResult ? await response.json(parsedResult).end() : await response.empty().end()
    }
  }
}

const parseAndError = async <T extends LuftObject<any> | undefined>(
  validator: T,
  getData: () => unknown | Promise<unknown>,
  location: "query" | "headers" | "path" | "body" | "response",
  statusCode: Status = Status.HTTP_400_BAD_REQUEST
): Promise<T extends LuftObject<any> ? LuftInfer<T> : undefined> => {
  if (validator === undefined) return undefined as T extends LuftObject<any> ? LuftInfer<T> : undefined
  const data = await getData()
  const parsedData = validator.coerceSave(data)
  if (!parsedData.success) {
    throw new HTTPException(statusCode, { issues: parsedData.issues, location: location })
  }
  return parsedData.data as T extends LuftObject<any> ? LuftInfer<T> : undefined
}

const extractSingleElementFromList = <T extends LuftObject<Record<string, LuftType>> | undefined>(validator: T): T => {
  if (validator === undefined) return undefined as T

  const extract: ValidationHook<unknown, unknown, unknown> = (value: unknown) => {
    if (Array.isArray(value) && value.length === 1) return { action: "continue", data: value[0] }
    return { action: "continue", data: value }
  }

  const applyExtract = (validators: LuftType[]) => {
    for (const v of validators) {
      if (v instanceof LuftUnion) {
        applyExtract(v.schema.types)
      } else if (!(v instanceof LuftArray) && !(v instanceof LuftTuple)) v.beforeHook(extract as any, false)
    }
  }

  const copy = validator.clone()
  applyExtract(Object.values(Object.values(copy.schema.type)))
  return copy as T
}
