/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { OpenApiZodAny } from "@anatine/zod-openapi"
import { jsonParser } from "@luftschloss/body"
import { BaseRouter, HTTP_METHODS } from "@luftschloss/core"
import { PathsObject } from "openapi3-ts"
import { z } from "zod"
import { ApiRoute, RouterParams } from "./api.route"

export type OpenApiHandler<
  URL_PARAMS extends OpenApiZodAny,
  BODY extends OpenApiZodAny,
  RESPONSE extends OpenApiZodAny
> = (url: z.infer<URL_PARAMS>, body: z.infer<BODY>) => z.infer<RESPONSE> | Promise<z.infer<RESPONSE>>

export class ApiRouter extends BaseRouter {
  private readonly _apiRoutes: PathsObject = {}

  public get apiRoutes(): Readonly<PathsObject> {
    return this._apiRoutes
  }

  public handle<URL_PARAMS extends OpenApiZodAny, BODY extends OpenApiZodAny, RESPONSE extends OpenApiZodAny>(
    method: HTTP_METHODS | HTTP_METHODS[] | "*",
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, z.infer<RESPONSE>> {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot add any new routes")
    }

    return new ApiRoute<URL_PARAMS, BODY, z.infer<RESPONSE>>(this, this._routeCollector, method, url, params)
  }

  public delete<URL_PARAMS extends OpenApiZodAny, BODY extends OpenApiZodAny, RESPONSE extends OpenApiZodAny>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("DELETE", url, params)
  }

  public get<URL_PARAMS extends OpenApiZodAny, RESPONSE extends OpenApiZodAny>(
    url: string,
    params: RouterParams<URL_PARAMS, never, RESPONSE>
  ): ApiRoute<URL_PARAMS, never, RESPONSE> {
    return this.handle("GET", url, params)
  }

  public head<URL_PARAMS extends OpenApiZodAny, RESPONSE extends OpenApiZodAny>(
    url: string,
    params: RouterParams<URL_PARAMS, never, RESPONSE>
  ): ApiRoute<URL_PARAMS, never, RESPONSE> {
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
