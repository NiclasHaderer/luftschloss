/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { RouterBase } from "@luftschloss/server"
import { ApiRoute, CollectedRoute, RouterParams } from "./api.route"
import { LuftObject } from "@luftschloss/validation"
import { jsonParser } from "@luftschloss/body"

const EMPTY_OBJECT = {
  body: undefined,
  path: undefined,
  headers: undefined,
  response: undefined,
  query: undefined,
}

export class ApiRouter extends RouterBase {
  public readonly apiRoutes: CollectedRoute[] = []

  public build<
    PATH extends LuftObject<any> | undefined = undefined,
    QUERY extends LuftObject<any> | undefined = undefined,
    BODY extends LuftObject<any> | undefined = undefined,
    HEADERS extends LuftObject<any> | undefined = undefined,
    RESPONSE extends LuftObject<any> | undefined = undefined
  >(
    params: Partial<RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot add any new routes")
    }

    const route = new ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>(this, this.routeCollector, {
      ...EMPTY_OBJECT,
      ...params,
    } as RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>)

    void route.on("listenerAttached", result => this.apiRoutes.push(result))
    return route
  }
}

export const apiRouter = () => {
  return new ApiRouter().pipe(jsonParser())
}
