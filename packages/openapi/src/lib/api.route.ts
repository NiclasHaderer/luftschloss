/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import {
  HTTP_METHODS,
  HTTPException,
  LRequest,
  LResponse,
  ROUTE_HANDLER,
  RouteCollector,
  Status,
} from "@luftschloss/server"
import { ApiRouter } from "./api.router"
import { LuftInfer, LuftObject } from "@luftschloss/validation"
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

export class ApiRoute<
  PATH extends LuftObject<any> | undefined,
  QUERY extends LuftObject<any> | undefined,
  BODY extends LuftObject<any> | undefined,
  HEADERS extends LuftObject<any> | undefined,
  RESPONSE extends LuftObject<any> | undefined
> {
  public constructor(
    private router: ApiRouter,
    private collector: RouteCollector,
    private method: HTTP_METHODS | HTTP_METHODS[] | "*",
    private url: string,
    private validators: RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ) {}

  public handle(callHandler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>): ApiRouter {
    if (Array.isArray(this.method)) {
      this.method.forEach(m => this.collector.add(this.url, m, this.wrapWithOpenApi(this.validators, callHandler)))
    } else {
      this.collector.add(this.url, this.method, this.wrapWithOpenApi(this.validators, callHandler))
    }
    return this.router
  }

  public info(infoModifier: () => void): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    // TODO give the ability to merge in an info object for the path.
    //  Perhaps only allow an object which will be merged
    return this
  }

  private wrapWithOpenApi(
    params: RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>,
    handler: OpenApiHandler<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ROUTE_HANDLER {
    return async (request: LRequest, response: LResponse): Promise<void> => {
      const parsedPath = await parseAndError(params.path, () => request.path, "path")
      // TODO add a pre validation function to the types which will extract a query param (if it is alone into a single one)
      const parsedQuery = await parseAndError(params.query, () => request.url.searchParams.encode(), "query")
      const parsedBody = await parseAndError(params.body, () => request.json(), "body")
      // TODO add a pre validation function to the types which will extract a query param (if it is alone into a single one)
      const parsedHeaders = await parseAndError(params.headers, () => params.headers, "headers")

      const result = await handler({
        path: parsedPath,
        body: parsedBody,
        query: parsedQuery,
        headers: parsedHeaders,
      })

      const parsedResult = await parseAndError(
        params.response,
        () => result,
        "response",
        Status.HTTP_500_INTERNAL_SERVER_ERROR
      )
      parsedResult ? response.json(parsedResult) : response.empty()
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
    throw new HTTPException(statusCode, { errors: parsedData.issues, location: location })
  }
  return parsedData.data as T extends LuftObject<any> ? LuftInfer<T> : undefined
}
