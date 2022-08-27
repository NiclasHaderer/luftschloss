/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { jsonParser } from "@luftschloss/body"
import * as OpenApi from "@luftschloss/openapi-schema"
import { HTTP_METHODS, RouterBase } from "@luftschloss/server"
import { ApiRoute, RouterParams } from "./api.route"
import { luft, LuftInfer, LuftNever, LuftObject, LuftType } from "@luftschloss/validation"

export type OpenApiHandler<URL_PARAMS extends LuftObject<any>, BODY extends LuftType, RESPONSE extends LuftType> = (
  url: LuftInfer<URL_PARAMS>,
  body: LuftInfer<BODY>
) => LuftInfer<RESPONSE> | Promise<LuftInfer<RESPONSE>>

export class ApiRouter extends RouterBase {
  public get apiRoutes(): OpenApi.Paths {
    // TODO fill in handle method
    return {}
  }

  public handle<URL_PARAMS extends LuftObject<any>, BODY extends LuftType, RESPONSE extends LuftType>(
    method: HTTP_METHODS | HTTP_METHODS[] | "*",
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot add any new routes")
    }

    return new ApiRoute<URL_PARAMS, BODY, RESPONSE>(this, this.routeCollector, method, url, params)
  }

  public delete<URL_PARAMS extends LuftObject<any>, BODY extends LuftType, RESPONSE extends LuftType>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("DELETE", url, params)
  }

  public get<URL_PARAMS extends LuftObject<any>, RESPONSE extends LuftType>(
    url: string,
    params: Omit<RouterParams<URL_PARAMS, LuftNever, RESPONSE>, "body">
  ): ApiRoute<URL_PARAMS, LuftNever, RESPONSE> {
    return this.handle("GET", url, { ...params, body: luft.never() })
  }

  public head<URL_PARAMS extends LuftObject<any>, RESPONSE extends LuftType>(
    url: string,
    params: Omit<RouterParams<URL_PARAMS, LuftNever, RESPONSE>, "body">
  ): ApiRoute<URL_PARAMS, LuftNever, RESPONSE> {
    return this.handle("HEAD", url, { ...params, body: luft.never() })
  }

  public patch<URL_PARAMS extends LuftObject<any>, BODY extends LuftType, RESPONSE extends LuftType>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("PATCH", url, params)
  }

  public options<URL_PARAMS extends LuftObject<any>, BODY extends LuftType, RESPONSE extends LuftType>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("OPTIONS", url, params)
  }

  public post<URL_PARAMS extends LuftObject<any>, BODY extends LuftType, RESPONSE extends LuftType>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("POST", url, params)
  }

  public put<URL_PARAMS extends LuftObject<any>, BODY extends LuftType, RESPONSE extends LuftType>(
    url: string,
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>
  ): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    return this.handle("PUT", url, params)
  }
}

export const apiRouter = () => {
  return new ApiRouter().pipe(jsonParser())
}
