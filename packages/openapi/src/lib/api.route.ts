/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import {
  HTTP_METHODS,
  HTTPException,
  LRequest,
  LResponse,
  ROUTE_HANDLER,
  RouteCollector,
  Status,
} from "@luftschloss/server"
import { ApiRouter, OpenApiHandler } from "./api.router"
import { LuftInfer, LuftObject, LuftType } from "@luftschloss/validation"

export interface RouterParams<URL_PARAMS extends LuftObject<any>, BODY extends LuftType, RESPONSE extends LuftType> {
  url: URL_PARAMS
  body: BODY
  response: RESPONSE
}

export class ApiRoute<URL_PARAMS extends LuftObject<any>, BODY extends LuftType, RESPONSE extends LuftType> {
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

  public info(infoModifier: () => void): ApiRoute<URL_PARAMS, BODY, RESPONSE> {
    // TODO
    return this
  }

  private wrapWithOpenApi<URL_PARAMS extends LuftObject<any>, BODY extends LuftType, RESPONSE extends LuftType>(
    params: RouterParams<URL_PARAMS, BODY, RESPONSE>,
    handler: OpenApiHandler<URL_PARAMS, BODY, RESPONSE>,
    parseBody: boolean
  ): ROUTE_HANDLER {
    return async (request: LRequest, response: LResponse): Promise<void> => {
      const pathParams = {
        ...request.pathParams(),
        ...request.urlParams.encode(),
      }

      // TODO add a pre validation function to the types which will extract a query param (if it is alone into a single one)
      const reqUrlParsed = params.url.coerceSave(pathParams)
      if (!reqUrlParsed.success) {
        throw new HTTPException(Status.HTTP_400_BAD_REQUEST, reqUrlParsed.issues)
      }

      let body: LuftInfer<BODY> | null = null
      if (parseBody) {
        const rawBody = await request.json()
        const reqBodyParsed = params.body.coerceSave(rawBody)
        if (!reqBodyParsed.success) {
          throw new HTTPException(Status.HTTP_400_BAD_REQUEST, reqBodyParsed.issues)
        }
        body = reqBodyParsed.data as LuftInfer<BODY>
      }
      const responseBody = await handler(reqUrlParsed.data as LuftInfer<URL_PARAMS>, body as LuftInfer<BODY>)

      const resBodyParsed = params.response.validateSave(responseBody)
      if (!resBodyParsed.success) {
        throw new HTTPException(Status.HTTP_500_INTERNAL_SERVER_ERROR, resBodyParsed.issues)
      }
      response.json(resBodyParsed.data)
    }
  }
}
