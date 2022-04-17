/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { OpenApiZodAny } from "@anatine/zod-openapi"
import { jsonParser } from "@luftschloss/body"
import { BaseRouter, HTTP_METHODS, HTTPException, LRequest, LResponse, ROUTE_HANDLER, Status } from "@luftschloss/core"
import { z } from "zod"

export type OpenApiHandler<
  URL_PARAMS extends OpenApiZodAny,
  BODY extends OpenApiZodAny,
  RESPONSE extends OpenApiZodAny
> = (url: z.infer<URL_PARAMS>, body: z.infer<BODY>) => z.infer<RESPONSE> | Promise<z.infer<RESPONSE>>

export interface ApiRoute<
  URL_PARAMS extends OpenApiZodAny,
  BODY extends OpenApiZodAny,
  RESPONSE extends OpenApiZodAny
> {
  handle(handler: OpenApiHandler<URL_PARAMS, BODY, RESPONSE>): ApiRouter
}

export interface RouterParams<
  URL_PARAMS extends OpenApiZodAny,
  BODY extends OpenApiZodAny,
  RESPONSE extends OpenApiZodAny
> {
  url: URL_PARAMS
  body: BODY
  response: RESPONSE
}

const wrapWithOpenApi = <URL_PARAMS extends OpenApiZodAny, BODY extends OpenApiZodAny, RESPONSE extends OpenApiZodAny>(
  params: RouterParams<URL_PARAMS, BODY, RESPONSE>,
  handler: OpenApiHandler<URL_PARAMS, BODY, RESPONSE>
): ROUTE_HANDLER => {
  return async (request: LRequest, response: LResponse): Promise<void> => {
    const body = await request.body()
    const urlParams = {
      ...request.pathParams(),
      //eslint-disable-next-line @typescript-eslint/no-unsafe-call
      ...request.urlParams.asObject(),
    } as Record<string, any>

    const reqBodyParsed = params.body.safeParse(body)
    if (!reqBodyParsed.success) {
      throw new HTTPException(Status.HTTP_400_BAD_REQUEST, reqBodyParsed.error.errors)
    }

    const reqUrlParsed = params.url.safeParse(urlParams)
    if (!reqUrlParsed.success) {
      throw new HTTPException(Status.HTTP_400_BAD_REQUEST, reqUrlParsed.error.errors)
    }

    const responseBody = await handler(urlParams, body)
    const resBodyParsed = params.body.safeParse(responseBody)
    if (!resBodyParsed.success) {
      throw new HTTPException(Status.HTTP_500_INTERNAL_SERVER_ERROR, resBodyParsed.error.errors)
    }
    //eslint-disable-next-line @typescript-eslint/no-unsafe-call
    response.json(reqBodyParsed.data)
  }
}

/**
 * TODO some methods cannot have a body
 */
export class ApiRouter extends BaseRouter {
  public handle<URL_PARAMS extends OpenApiZodAny, BODY extends OpenApiZodAny, RESPONSE extends OpenApiZodAny>(
    method: HTTP_METHODS | HTTP_METHODS[] | "*",
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, z.infer<RESPONSE>> {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot add any new routes")
    }

    return {
      handle: (handler: (url: URL_PARAMS, body: BODY) => z.infer<RESPONSE>): ApiRouter => {
        if (Array.isArray(method)) {
          method.forEach(m => this._routeCollector.add(url, m, wrapWithOpenApi(params, handler)))
        } else {
          this._routeCollector.add(url, method, wrapWithOpenApi(params, handler))
        }
        return this
      },
    }
  }

  public delete<URL_PARAMS extends OpenApiZodAny, BODY extends OpenApiZodAny, RESPONSE extends OpenApiZodAny>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("DELETE", url, params)
  }

  public get<URL_PARAMS extends OpenApiZodAny, BODY extends OpenApiZodAny, RESPONSE extends OpenApiZodAny>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("GET", url, params)
  }

  public head<URL_PARAMS extends OpenApiZodAny, BODY extends OpenApiZodAny, RESPONSE extends OpenApiZodAny>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("HEAD", url, params)
  }

  public patch<URL_PARAMS extends OpenApiZodAny, BODY extends OpenApiZodAny, RESPONSE extends OpenApiZodAny>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("PATCH", url, params)
  }

  public options<URL_PARAMS extends OpenApiZodAny, BODY extends OpenApiZodAny, RESPONSE extends OpenApiZodAny>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("OPTIONS", url, params)
  }

  public post<URL_PARAMS extends OpenApiZodAny, BODY extends OpenApiZodAny, RESPONSE extends OpenApiZodAny>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("POST", url, params)
  }

  public put<URL_PARAMS extends OpenApiZodAny, BODY extends OpenApiZodAny, RESPONSE extends OpenApiZodAny>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("PUT", url, params)
  }
}

export const apiRouter = () => {
  const router = new ApiRouter()
  router.pipe(jsonParser())
  return router
}
