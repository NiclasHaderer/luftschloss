/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { GenericEventEmitter, normalizePath } from "@luftschloss/common"
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
  url: `/${string}`
  method: HTTP_METHODS
  validator: RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>
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
  private readonly methods: HTTP_METHODS[]

  public constructor(
    private router: ApiRouter,
    private collector: RouteCollector,
    method: HTTP_METHODS | HTTP_METHODS[] | "*",
    private url: string,
    private validators: RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ) {
    super()
    this.methods = Array.isArray(method) ? method : method === "*" ? Object.values(HTTP_METHODS) : [method]
    this.validators.query = extractSingleElementFromList(this.validators.query)
    this.validators.headers = extractSingleElementFromList(this.validators.headers)
  }

  public handle(callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>): ApiRouter {
    this.methods.forEach(m => this.collector.add(this.url, m, this.wrapWithOpenApi(callHandler)))

    for (const method of this.methods) {
      this.complete("listenerAttached", {
        url: normalizePath(this.url),
        method: method,
        validator: {
          ...this.validators,
          body: method === "GET" || method === "HEAD" ? undefined : this.validators.body,
        },
      })
    }

    return this.router
  }

  public info(infoModifier: () => void): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    // TODO give the ability to merge in an info object for the path.
    //  Perhaps only allow an object which will be merged
    return this
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
