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

const EMPTY_OBJECT = {
  body: undefined,
  path: undefined,
  headers: undefined,
  response: undefined,
  query: undefined,
}

export class ApiRouter extends RouterBase {
  public get apiRoutes(): OpenApi.Paths {
    // TODO fill in handle method
    return {}
  }

  public handle<
    PATH extends LuftObject<any> | undefined = undefined,
    QUERY extends LuftObject<any> | undefined = undefined,
    BODY extends LuftObject<any> | undefined = undefined,
    HEADERS extends LuftObject<any> | undefined = undefined,
    RESPONSE extends LuftObject<any> | undefined = undefined
  >(
    method: HTTP_METHODS | HTTP_METHODS[] | "*",
    url: string,
    params: Partial<RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot add any new routes")
    }

    return new ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>(this, this.routeCollector, method, url, {
      ...EMPTY_OBJECT,
      ...params,
    } as RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>)
  }

  public delete<
    PATH extends LuftObject<any> | undefined = undefined,
    QUERY extends LuftObject<any> | undefined = undefined,
    BODY extends LuftObject<any> | undefined = undefined,
    HEADERS extends LuftObject<any> | undefined = undefined,
    RESPONSE extends LuftObject<any> | undefined = undefined
  >(
    url: string,
    params: Partial<RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("DELETE", url, {
      ...EMPTY_OBJECT,
      ...params,
    } as RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>)
  }

  public get<
    PATH extends LuftObject<any> | undefined = undefined,
    QUERY extends LuftObject<any> | undefined = undefined,
    HEADERS extends LuftObject<any> | undefined = undefined,
    RESPONSE extends LuftObject<any> | undefined = undefined
  >(
    url: string,
    params: Partial<Omit<RouterParams<PATH, QUERY, undefined, HEADERS, RESPONSE>, "body">>
  ): ApiRoute<PATH, QUERY, undefined, HEADERS, RESPONSE> {
    return this.handle("GET", url, {
      ...EMPTY_OBJECT,
      ...params,
    } as RouterParams<PATH, QUERY, undefined, HEADERS, RESPONSE>)
  }

  public head<
    PATH extends LuftObject<any> | undefined = undefined,
    QUERY extends LuftObject<any> | undefined = undefined,
    HEADERS extends LuftObject<any> | undefined = undefined,
    RESPONSE extends LuftObject<any> | undefined = undefined
  >(
    url: string,
    params: Partial<Omit<RouterParams<PATH, QUERY, undefined, HEADERS, RESPONSE>, "body">>
  ): ApiRoute<PATH, QUERY, undefined, HEADERS, RESPONSE> {
    return this.handle("HEAD", url, {
      ...EMPTY_OBJECT,
      ...params,
    } as RouterParams<PATH, QUERY, undefined, HEADERS, RESPONSE>)
  }

  public patch<
    PATH extends LuftObject<any> | undefined = undefined,
    QUERY extends LuftObject<any> | undefined = undefined,
    BODY extends LuftObject<any> | undefined = undefined,
    HEADERS extends LuftObject<any> | undefined = undefined,
    RESPONSE extends LuftObject<any> | undefined = undefined
  >(
    url: string,
    params: Partial<RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("PATCH", url, {
      ...EMPTY_OBJECT,
      ...params,
    } as RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>)
  }

  public options<
    PATH extends LuftObject<any> | undefined = undefined,
    QUERY extends LuftObject<any> | undefined = undefined,
    BODY extends LuftObject<any> | undefined = undefined,
    HEADERS extends LuftObject<any> | undefined = undefined,
    RESPONSE extends LuftObject<any> | undefined = undefined
  >(
    url: string,
    params: Partial<RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("OPTIONS", url, {
      ...EMPTY_OBJECT,
      ...params,
    } as RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>)
  }

  public post<
    PATH extends LuftObject<any> | undefined = undefined,
    QUERY extends LuftObject<any> | undefined = undefined,
    BODY extends LuftObject<any> | undefined = undefined,
    HEADERS extends LuftObject<any> | undefined = undefined,
    RESPONSE extends LuftObject<any> | undefined = undefined
  >(
    url: string,
    params: Partial<RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("POST", url, {
      ...EMPTY_OBJECT,
      ...params,
    } as RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>)
  }

  public put<
    PATH extends LuftObject<any> | undefined = undefined,
    QUERY extends LuftObject<any> | undefined = undefined,
    BODY extends LuftObject<any> | undefined = undefined,
    HEADERS extends LuftObject<any> | undefined = undefined,
    RESPONSE extends LuftObject<any> | undefined = undefined
  >(
    url: string,
    params: Partial<RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    return this.handle("PUT", url, {
      ...EMPTY_OBJECT,
      ...params,
    } as RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>)
  }
}

export const apiRouter = () => {
  return new ApiRouter().pipe(jsonParser())
}
