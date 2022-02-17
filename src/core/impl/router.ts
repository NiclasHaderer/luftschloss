import { HTTP_METHODS, ROUTE_HANDLER } from "../types/http"
import { MountingOptions, Router } from "../types/router"
import { RouteingControllerImpl } from "./route-controller"
import { ReadonlyRoutingController } from "../types/routing-controller"
import { MiddleWareInterceptor, MiddlewareRepresentation } from "../types/middleware"

export class RouterImpl implements Router {
  protected _routingController = new RouteingControllerImpl()

  public get middleware(): Iterable<MiddlewareRepresentation> {
    return this._routingController.middleware
  }

  public get routes(): ReadonlyRoutingController {
    return this._routingController
  }

  public delete(url: string, callback: ROUTE_HANDLER): void {
    this.handle("DELETE", url, callback)
  }

  public get(url: string, callback: ROUTE_HANDLER): void {
    this.handle("GET", url, callback)
  }

  public handle(method: HTTP_METHODS | "*", url: string, callback: ROUTE_HANDLER): void {
    this._routingController.add(url, method, callback)
  }

  public mount(router: Router | Router[], options: MountingOptions = {}): this {
    const mountOne = ({ routes }: Router, { basePath }: MountingOptions) => {
      this._routingController.addMany(routes, basePath || "")
    }

    if (Array.isArray(router)) {
      router.forEach(r => mountOne(r, options))
    } else {
      mountOne(router, options)
    }
    return this
  }

  public patch(url: string, callback: ROUTE_HANDLER): void {
    this.handle("PATCH", url, callback)
  }

  public pipe(...middleware: MiddleWareInterceptor[]): this {
    this._routingController.addMiddleware(...middleware)
    return this
  }

  public post(url: string, callback: ROUTE_HANDLER): void {
    this.handle("POST", url, callback)
  }

  public put(url: string, callback: ROUTE_HANDLER): void {
    this.handle("PUT", url, callback)
  }
}

export const createRouter = () => {
  return new RouterImpl()
}
