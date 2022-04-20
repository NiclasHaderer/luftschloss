/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */

import { OpenApiZodAny } from "@anatine/zod-openapi"
import {
  HTTP_METHODS,
  HTTPException,
  LRequest,
  LResponse,
  ROUTE_HANDLER,
  RouteCollector,
  Status,
} from "@luftschloss/core"
import { z } from "zod"
import { ApiRouter, OpenApiHandler } from "./api.router"

export interface RouterParams<
  URL_PARAMS extends OpenApiZodAny,
  BODY extends OpenApiZodAny,
  RESPONSE extends OpenApiZodAny
> {
  url: URL_PARAMS
  body: BODY
  response: RESPONSE
}

export class ApiRoute<URL_PARAMS extends OpenApiZodAny, BODY extends OpenApiZodAny, RESPONSE extends OpenApiZodAny> {
  constructor(
    private router: ApiRouter,
    private collector: RouteCollector,
    private method: HTTP_METHODS | HTTP_METHODS[] | "*",
    private url: string,
    private params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ) {}

  public handle(handler: (url: URL_PARAMS, body: BODY) => z.infer<RESPONSE>): ApiRouter {
    if (Array.isArray(this.method)) {
      this.method.forEach(m =>
        this.collector.add(this.url, m, this.wrapWithOpenApi(this.params, handler, m !== "HEAD" && m !== "GET"))
      )
    } else {
      this.collector.add(
        this.url,
        this.method,
        this.wrapWithOpenApi(this.params, handler, this.method !== "HEAD" && this.method !== "GET")
      )
    }
    return this.router
  }

  public info(): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    // TODO
    return this
  }

  private wrapWithOpenApi<URL_PARAMS extends OpenApiZodAny, BODY extends OpenApiZodAny, RESPONSE extends OpenApiZodAny>(
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>,
    handler: OpenApiHandler<URL_PARAMS, BODY, RESPONSE>,
    parseBody: boolean
  ): ROUTE_HANDLER {
    return async (request: LRequest, response: LResponse): Promise<void> => {
      let body = null
      if (parseBody) {
        body = await request.body()
        const reqBodyParsed = params.body.safeParse(body)
        if (!reqBodyParsed.success) {
          throw new HTTPException(Status.HTTP_400_BAD_REQUEST, reqBodyParsed.error.errors)
        }
      }

      const pathParams = request.pathParams()
      const queryParams = request.urlParams.asObject()
      const urlParams = {
        ...queryParams,
        ...pathParams,
      } as Record<string, any>
      const reqUrlParsed = params.url.safeParse(urlParams)
      if (!reqUrlParsed.success) {
        throw new HTTPException(Status.HTTP_400_BAD_REQUEST, reqUrlParsed.error.errors)
      }

      const responseBody = await handler(urlParams, body)
      const resBodyParsed = params.body.safeParse(responseBody)
      if (!resBodyParsed.success) {
        throw new HTTPException(Status.HTTP_500_INTERNAL_SERVER_ERROR, resBodyParsed.error.errors)
      }
      response.json(responseBody.data)
    }
  }
}
