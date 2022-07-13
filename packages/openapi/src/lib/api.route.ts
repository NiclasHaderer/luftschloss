/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */

import {
  HTTP_METHODS,
  HTTPException,
  LRequest,
  LResponse,
  ROUTE_HANDLER,
  RouteCollector,
  Status,
} from "@luftschloss/server"
import { TypeOf, ZodArray, ZodNever, ZodObject, ZodSet, ZodTuple } from "zod"
import { ZodRawShape } from "zod/lib/types"
import { ApiRouter, OpenApiHandler } from "./api.router"
import { ZodApiType } from "./types"

export interface RouterParams<
  URL_PARAMS extends ZodObject<any> | ZodNever,
  BODY extends ZodObject<any> | ZodNever,
  RESPONSE extends ZodObject<any> | ZodNever
> {
  url: URL_PARAMS
  body: BODY
  response: RESPONSE
}

export class ApiRoute<URL_PARAMS extends ZodApiType, BODY extends ZodApiType, RESPONSE extends ZodApiType> {
  public constructor(
    private router: ApiRouter,
    private collector: RouteCollector,
    private method: HTTP_METHODS | HTTP_METHODS[] | "*",
    private url: string,
    private params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ) {}

  public handle(callHandler: OpenApiHandler<URL_PARAMS, BODY, RESPONSE>): ApiRouter {
    if (Array.isArray(this.method)) {
      this.method.forEach(m =>
        this.collector.add(this.url, m, this.wrapWithOpenApi(this.params, callHandler, m !== "HEAD" && m !== "GET"))
      )
    } else {
      this.collector.add(
        this.url,
        this.method,
        this.wrapWithOpenApi(this.params, callHandler, this.method !== "HEAD" && this.method !== "GET")
      )
    }
    return this.router
  }

  public info(): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    // TODO
    return this
  }

  private wrapWithOpenApi<URL_PARAMS extends ZodApiType, BODY extends ZodApiType, RESPONSE extends ZodApiType>(
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>,
    handler: OpenApiHandler<URL_PARAMS, BODY, RESPONSE>,
    parseBody: boolean
  ): ROUTE_HANDLER {
    return async (request: LRequest, response: LResponse): Promise<void> => {
      const pathParams = request.pathParams()
      const urlParams = {
        ...pathParams,
      } as Record<string, any>

      const queryParams = request.urlParams

      // TODO check if the request parameter object has only allowed keys ZodUrlApiType
      if (!(params.url instanceof ZodNever)) {
        const keys = Object.keys(params.url.shape as ZodRawShape)
        for (const key of keys) {
          let zodValue = params.url.shape[key]
          if (typeof zodValue.unwrap === "function") {
            zodValue = zodValue.unwrap()
          }

          if (
            (zodValue instanceof ZodArray || zodValue instanceof ZodSet || zodValue instanceof ZodTuple) &&
            queryParams.has(key)
          ) {
            urlParams[key] = queryParams.getAll(key)
          } else if (queryParams.has(key)) {
            urlParams[key] = queryParams.get(key)
          }
        }
      }

      const reqUrlParsed = params.url.parse(urlParams)
      if (!reqUrlParsed.success) {
        //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        throw new HTTPException(Status.HTTP_400_BAD_REQUEST, reqUrlParsed.error.errors)
      }

      let body = null
      if (parseBody) {
        body = await request.json()
        const reqBodyParsed = params.body.safeParse(body)
        if (!reqBodyParsed.success) {
          throw new HTTPException(Status.HTTP_400_BAD_REQUEST, reqBodyParsed.error.errors)
        }
      }
      const responseBody = await handler(urlParams, body as TypeOf<BODY>)
      const resBodyParsed = params.response.safeParse(responseBody)
      if (!resBodyParsed.success) {
        throw new HTTPException(Status.HTTP_500_INTERNAL_SERVER_ERROR, resBodyParsed.error.errors)
      }
      response.json(resBodyParsed.data)
    }
  }
}
