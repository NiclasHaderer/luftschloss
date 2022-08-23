import { RouterBase } from "./base.router"
import { HTTP_METHODS, LRequest, LResponse } from "../core"
import { Promisable } from "@luftschloss/common"

export type RESPONSE_ROUTE_HANDLER = (
  request: LRequest,
  response: LResponse
) => Promisable<null | undefined | string | object>

export class ResponseRouter extends RouterBase {
  public handle(method: HTTP_METHODS | HTTP_METHODS[] | "*", url: string, callback: RESPONSE_ROUTE_HANDLER): void {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot add any new routes")
    }
    if (Array.isArray(method)) {
      method.forEach(m => this.addRouteHandler(url, m, callback))
    } else {
      this.addRouteHandler(url, method, callback)
    }
  }

  public delete(url: string, callback: RESPONSE_ROUTE_HANDLER): void {
    this.handle("DELETE", url, callback)
  }

  public get(url: string, callback: RESPONSE_ROUTE_HANDLER): void {
    this.handle("GET", url, callback)
  }

  public head(url: string, callback: RESPONSE_ROUTE_HANDLER): void {
    this.handle("HEAD", url, callback)
  }

  public patch(url: string, callback: RESPONSE_ROUTE_HANDLER): void {
    this.handle("PATCH", url, callback)
  }

  public options(url: string, callback: RESPONSE_ROUTE_HANDLER): void {
    this.handle("OPTIONS", url, callback)
  }

  public post(url: string, callback: RESPONSE_ROUTE_HANDLER): void {
    this.handle("POST", url, callback)
  }

  public put(url: string, callback: RESPONSE_ROUTE_HANDLER): void {
    this.handle("PUT", url, callback)
  }

  public all(url: string, callback: RESPONSE_ROUTE_HANDLER): void {
    this.handle("*", url, callback)
  }

  private addRouteHandler(url: string, method: HTTP_METHODS | "*", callback: RESPONSE_ROUTE_HANDLER): void {
    const handler = async (request: LRequest, response: LResponse) => {
      const responseBody = await callback(request, response)
      if (responseBody === undefined || responseBody === null) {
        response.empty()
      } else if (typeof responseBody === "string") {
        response.text(responseBody)
      } else if (typeof responseBody === "object") {
        response.json(responseBody)
      }
    }

    this.routeCollector.add(url, method, handler)
  }
}
