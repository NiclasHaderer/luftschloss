/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { HTTP_METHODS, ROUTE_HANDLER } from "../core"
import { Router } from "./router"
import { BaseRouter } from "./base.router"

export class DefaultRouter extends BaseRouter implements Router {
  public handle(method: HTTP_METHODS | "*", url: string, callback: ROUTE_HANDLER): void {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot add any new routes")
    }
    this._routeCollector.add(url, method, callback)
  }

  public delete(url: string, callback: ROUTE_HANDLER): void {
    this.handle("DELETE", url, callback)
  }

  public get(url: string, callback: ROUTE_HANDLER): void {
    this.handle("GET", url, callback)
  }

  public head(url: string, callback: ROUTE_HANDLER): void {
    this.handle("HEAD", url, callback)
  }

  public patch(url: string, callback: ROUTE_HANDLER): void {
    this.handle("PATCH", url, callback)
  }

  public options(url: string, callback: ROUTE_HANDLER): void {
    this.handle("OPTIONS", url, callback)
  }

  public post(url: string, callback: ROUTE_HANDLER): void {
    this.handle("POST", url, callback)
  }

  public put(url: string, callback: ROUTE_HANDLER): void {
    this.handle("PUT", url, callback)
  }
}

export const defaultRouter = (): DefaultRouter => new DefaultRouter()
