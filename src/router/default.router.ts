import { MountingOptions, Router } from "../core/router.model"
import { RouteCollectorImpl } from "../core/route-controller"
import { MiddleWareInterceptor } from "../middleware/middleware"
import { HTTP_METHODS, ReadonlyRouteCollector, ROUTE_HANDLER } from "../core/route-collector.model"

export class DefaultRouter implements Router {
  private readonly _routeCollector = new RouteCollectorImpl()
  private readonly subRoutes: { router: Router; options: MountingOptions }[] = []
  protected locked = false

  public get children(): { router: Router; options: MountingOptions }[] {
    return this.subRoutes
  }

  public get routes(): ReadonlyRouteCollector {
    return this._routeCollector
  }

  public mount(routers: Router | Router[], options: MountingOptions = {}): this {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot mount any new routers")
    }

    if (!Array.isArray(routers)) {
      routers = [routers]
    }

    for (const router of routers) {
      this.subRoutes.push({ router, options })
    }

    return this
  }

  public lock(): void {
    this.locked = true
    this.subRoutes.map(r => r.router).forEach(r => r.lock())
  }

  public pipe(...middleware: MiddleWareInterceptor[]): this {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot add a new middleware")
    }

    this._routeCollector.addMiddleware(...middleware)
    return this
  }

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

  public patch(url: string, callback: ROUTE_HANDLER): void {
    this.handle("PATCH", url, callback)
  }

  public post(url: string, callback: ROUTE_HANDLER): void {
    this.handle("POST", url, callback)
  }

  public put(url: string, callback: ROUTE_HANDLER): void {
    this.handle("PUT", url, callback)
  }
}

export const defaultRouter = () => {
  return new DefaultRouter()
}
