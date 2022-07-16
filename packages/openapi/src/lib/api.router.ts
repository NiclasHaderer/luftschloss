/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { jsonParser } from "@luftschloss/body"
import { RouterBase, HTTP_METHODS } from "@luftschloss/server"
import { PathsObject } from "openapi3-ts"
import { z, ZodNever, ZodObject } from "zod"
import { ApiRoute, RouterParams } from "./api.route"
import { ZodApiType } from "./types"

export type OpenApiHandler<URL_PARAMS extends ZodApiType, BODY extends ZodApiType, RESPONSE extends ZodApiType> = (
  url: z.infer<URL_PARAMS>,
  body: z.infer<BODY>
) => z.infer<RESPONSE> | Promise<z.infer<RESPONSE>>

export class ApiRouter extends RouterBase {
  private readonly _apiRoutes: PathsObject = {}

  public get apiRoutes(): Readonly<PathsObject> {
    // TODO fill in handle method
    return this._apiRoutes
  }

  public handle<URL_PARAMS extends ZodApiType, BODY extends ZodApiType, RESPONSE extends ZodApiType>(
    method: HTTP_METHODS | HTTP_METHODS[] | "*",
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot add any new routes")
    }

    return new ApiRoute<URL_PARAMS, BODY, RESPONSE>(this, this._routeCollector, method, url, params)
  }

  public delete<
    URL_PARAMS extends ZodObject<any> | ZodNever,
    BODY extends ZodObject<any> | ZodNever,
    RESPONSE extends ZodObject<any> | ZodNever
  >(url: string, params: RouterParams<URL_PARAMS, BODY, RESPONSE>): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("DELETE", url, params)
  }

  public get<URL_PARAMS extends ZodObject<any>, RESPONSE extends ZodObject<any>>(
    url: string,
    params: Omit<RouterParams<URL_PARAMS, ZodNever, RESPONSE>, "body">
  ): ApiRoute<URL_PARAMS, ZodNever, RESPONSE> {
    return this.handle("GET", url, { ...params, body: z.never() })
  }

  public head<URL_PARAMS extends ZodApiType, RESPONSE extends ZodApiType>(
    url: string,
    params: Omit<RouterParams<URL_PARAMS, ZodNever, RESPONSE>, "body">
  ): ApiRoute<URL_PARAMS, ZodNever, RESPONSE> {
    return this.handle("HEAD", url, { ...params, body: z.never() })
  }

  public patch<URL_PARAMS extends ZodApiType, BODY extends ZodApiType, RESPONSE extends ZodApiType>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("PATCH", url, params)
  }

  public options<URL_PARAMS extends ZodApiType, BODY extends ZodApiType, RESPONSE extends ZodApiType>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("OPTIONS", url, params)
  }

  public post<URL_PARAMS extends ZodApiType, BODY extends ZodApiType, RESPONSE extends ZodApiType>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("POST", url, params)
  }

  public put<URL_PARAMS extends ZodApiType, BODY extends ZodApiType, RESPONSE extends ZodApiType>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("PUT", url, params)
  }
}

export const apiRouter = () => {
  return new ApiRouter().pipe(jsonParser())
}
