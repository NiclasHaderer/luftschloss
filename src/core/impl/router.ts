import { HTTP_HANDLER, HTTP_METHODS } from "../types/http"
import { MountingOptions, Router } from "../types/router"
import { RouteCollectorImpl } from "./route-collector"
import { Middleware } from "../types/middleware"
import { ReadonlyRouteCollector } from "../types/route-controller"

export class RouterImpl implements Router {
  protected _routeCollector = new RouteCollectorImpl()

  public get middleware(): Middleware {
    return this._routeCollector.middleware
  }

  public get routes(): ReadonlyRouteCollector {
    return this._routeCollector
  }

  public delete(url: string, callback: HTTP_HANDLER): void {
    this.handle("DELETE", url, callback)
  }

  public get(url: string, callback: HTTP_HANDLER): void {
    this.handle("GET", url, callback)
  }

  public handle(method: HTTP_METHODS | "*", url: string, callback: HTTP_HANDLER): void {
    this._routeCollector.add(url, method, callback)
  }

  public mount(router: Router | Router[], options: MountingOptions = {}): this {
    const mountOne = ({ routes }: Router, { basePath }: MountingOptions) => {
      this._routeCollector.addMany(routes, basePath || "")
    }

    if (Array.isArray(router)) {
      router.forEach(r => mountOne(r, options))
    } else {
      mountOne(router, options)
    }
    return this
  }

  public patch(url: string, callback: HTTP_HANDLER): void {
    this.handle("PATCH", url, callback)
  }

  public post(url: string, callback: HTTP_HANDLER): void {
    this.handle("POST", url, callback)
  }

  public put(url: string, callback: HTTP_HANDLER): void {
    this.handle("PUT", url, callback)
  }
}

export const createRouter = () => {
  return new RouterImpl()
}
