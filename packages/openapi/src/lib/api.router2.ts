/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { jsonParser } from "@luftschloss/body"
import {
  HTTP_METHODS,
  HTTPException,
  LRequest,
  LResponse,
  ROUTE_HANDLER,
  RouteCollector,
  RouterBase,
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
import { CollectedRoute, OpenApiHandler, RouterParams } from "./api.route"
import { DeepPartial, GenericEventEmitter, normalizePath } from "@luftschloss/common"
import { Operation } from "@luftschloss/openapi-schema"

/* eslint-disable @typescript-eslint/no-explicit-any */

const EMPTY_OBJECT = {
  body: undefined,
  path: undefined,
  headers: undefined,
  response: undefined,
  query: undefined,
}

export class ApiRoute2<
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
    private router: ApiRouter2,
    private collector: RouteCollector,
    private validators: RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ) {
    super()
    this.validators.query = extractSingleElementFromList(this.validators.query)
    this.validators.headers = extractSingleElementFromList(this.validators.headers)
  }

  public info(info: DeepPartial<Operation>): ApiRoute2<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    this.infoObject = info
    return this
  }

  // TODO check if methods includes GET|HEAD and if yes make body nullable
  public handle(
    method: HTTP_METHODS | HTTP_METHODS[] | "*",
    path: string,
    callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute2<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    const methods = Array.isArray(method) ? method : method === "*" ? Object.values(HTTP_METHODS) : [method]
    for (const method of methods) {
      this.collector.add(path, method, this.wrapWithOpenApi(callHandler))
      this.emit("listenerAttached", {
        path: normalizePath(path),
        info: this.infoObject ?? {},
        method: method,
        validator: this.validators,
      })
    }
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

export class ApiRouter2 extends RouterBase {
  public readonly apiRoutes: CollectedRoute[] = []

  public c<
    PATH extends LuftObject<any> | undefined = undefined,
    QUERY extends LuftObject<any> | undefined = undefined,
    BODY extends LuftObject<any> | undefined = undefined,
    HEADERS extends LuftObject<any> | undefined = undefined,
    RESPONSE extends LuftObject<any> | undefined = undefined
  >(
    params: Partial<RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>>
  ): ApiRoute2<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot add any new routes")
    }

    const route = new ApiRoute2<PATH, QUERY, BODY, HEADERS, RESPONSE>(this, this.routeCollector, {
      ...EMPTY_OBJECT,
      ...params,
    } as RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>)

    void route.on("listenerAttached", result => this.apiRoutes.push(result))
    return route
  }
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

export const apiRouter2 = () => {
  return new ApiRouter2().pipe(jsonParser())
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
