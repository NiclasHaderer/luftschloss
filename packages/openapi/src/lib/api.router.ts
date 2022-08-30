/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { jsonParser } from "@luftschloss/body"
import * as OpenApi from "@luftschloss/openapi-schema"
import { HTTP_METHODS, RouterBase } from "@luftschloss/server"
import { ApiRoute, RouterParams } from "./api.route"
import { LuftObject } from "@luftschloss/validation"

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ApiRouter extends RouterBase {
  public get apiRoutes(): OpenApi.Paths {
    // TODO fill in handle method
    return {}
  }

  public handle<
    PATH extends LuftObject<any> | undefined,
    QUERY extends LuftObject<any> | undefined,
    BODY extends LuftObject<any> | undefined,
    HEADERS extends LuftObject<any> | undefined,
    RESPONSE extends LuftObject<any> | undefined
  >(
    method: HTTP_METHODS | HTTP_METHODS[] | "*",
    url: string,
    params: RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot add any new routes")
    }

    return new ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>(this, this.routeCollector, method, url, params)
  }

  public delete<
    PATH extends LuftObject<any> | undefined,
    QUERY extends LuftObject<any> | undefined,
    BODY extends LuftObject<any> | undefined,
    HEADERS extends LuftObject<any> | undefined,
    RESPONSE extends LuftObject<any> | undefined
  >(
    url: string,
    params: RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("DELETE", url, params)
  }

  public get<
    PATH extends LuftObject<any> | undefined,
    QUERY extends LuftObject<any> | undefined,
    HEADERS extends LuftObject<any> | undefined,
    RESPONSE extends LuftObject<any> | undefined
  >(
    url: string,
    params: Omit<RouterParams<PATH, QUERY, undefined, HEADERS, RESPONSE>, "body">
  ): ApiRoute<PATH, QUERY, undefined, HEADERS, RESPONSE> {
    return this.handle("GET", url, { ...params, body: undefined })
  }

  public head<
    PATH extends LuftObject<any> | undefined,
    QUERY extends LuftObject<any> | undefined,
    HEADERS extends LuftObject<any> | undefined,
    RESPONSE extends LuftObject<any> | undefined
  >(
    url: string,
    params: Omit<RouterParams<PATH, QUERY, undefined, HEADERS, RESPONSE>, "body">
  ): ApiRoute<PATH, QUERY, undefined, HEADERS, RESPONSE> {
    return this.handle("HEAD", url, { ...params, body: undefined })
  }

  public patch<
    PATH extends LuftObject<any> | undefined,
    QUERY extends LuftObject<any> | undefined,
    BODY extends LuftObject<any> | undefined,
    HEADERS extends LuftObject<any> | undefined,
    RESPONSE extends LuftObject<any> | undefined
  >(
    url: string,
    params: RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("PATCH", url, params)
  }

  public options<
    PATH extends LuftObject<any> | undefined,
    QUERY extends LuftObject<any> | undefined,
    BODY extends LuftObject<any> | undefined,
    HEADERS extends LuftObject<any> | undefined,
    RESPONSE extends LuftObject<any> | undefined
  >(
    url: string,
    params: RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("OPTIONS", url, params)
  }

  public post<
    PATH extends LuftObject<any> | undefined,
    QUERY extends LuftObject<any> | undefined,
    BODY extends LuftObject<any> | undefined,
    HEADERS extends LuftObject<any> | undefined,
    RESPONSE extends LuftObject<any> | undefined
  >(
    url: string,
    params: RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("POST", url, params)
  }

  public put<
    PATH extends LuftObject<any> | undefined,
    QUERY extends LuftObject<any> | undefined,
    BODY extends LuftObject<any> | undefined,
    HEADERS extends LuftObject<any> | undefined,
    RESPONSE extends LuftObject<any> | undefined
  >(
    url: string,
    params: RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("PUT", url, params)
  }
}

export const apiRouter = () => {
  return new ApiRouter().pipe(jsonParser())
}
