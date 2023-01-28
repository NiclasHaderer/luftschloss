/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import {RouterBase} from "@luftschloss/server";
import {LuftArray, LuftObject, LuftRecord, LuftType} from "@luftschloss/validation";
import {ApiRoute, CollectedRoute, RouterParams} from "./api.route";

const EMPTY_OBJECT = {
  body: undefined,
  path: undefined,
  headers: undefined,
  response: undefined,
  query: undefined,
};

export class ApiRouter extends RouterBase {
  public readonly apiRoutes: CollectedRoute[] = [];
  private tags: string[] = [];

  public build<
    PATH extends LuftObject<any> | undefined = undefined,
    QUERY extends LuftObject<any> | undefined = undefined,
    BODY extends LuftObject<any> | LuftArray<any> | LuftRecord<any, any> | undefined = undefined,
    HEADERS extends LuftObject<any> | undefined = undefined,
    RESPONSE extends LuftType | undefined = undefined
  >(
    params: Partial<RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>>
  ): ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE> {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot add any new routes");
    }

    return new ApiRoute<PATH, QUERY, BODY, HEADERS, RESPONSE>(this, this.routeCollector, this.tags, {
      ...EMPTY_OBJECT,
      ...params,
    } as RouterParams<PATH, QUERY, BODY, HEADERS, RESPONSE>);
  }

  public tag(...tags: string[]): ApiRouter {
    this.tags = tags;
    return this;
  }
}

export const apiRouter = () => {
  return new ApiRouter();
};
