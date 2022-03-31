import { RouteCollectorImpl } from "../core/route-collector"
import {
  isClassMiddleware,
  isHttpMiddleware,
  MiddleWareInterceptor,
  MiddlewareRepresentation,
  MiddlewareType,
  ReadonlyMiddlewares,
} from "../middleware"
import { ReadonlyRouteCollector } from "../core/route-collector.model"
import { MountingOptions, Router } from "./router"

export class BaseRouter implements Router {
  protected readonly subRouters: { router: Router; options: MountingOptions }[] = []
  protected readonly _routeCollector = new RouteCollectorImpl()
  protected _middleware: MiddlewareRepresentation[] = []
  protected _locked = false

  public get children(): { router: Router; options: MountingOptions }[] {
    return this.subRouters
  }

  public get locked(): boolean {
    return this._locked
  }

  public get middleware(): ReadonlyMiddlewares {
    return this._middleware
  }

  public get routes(): ReadonlyRouteCollector {
    return this._routeCollector
  }

  public lock(): void {
    this._locked = true
    this.subRouters.map(r => r.router).forEach(r => r.lock())
  }

  public pipe(...middleware: MiddleWareInterceptor[]): this {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot add a new middleware")
    }

    this.addMiddleware(...middleware)
    return this
  }

  protected addMiddleware(...middlewareList: MiddleWareInterceptor[]): void {
    for (const middleware of middlewareList) {
      if (isClassMiddleware(middleware)) {
        this._middleware.push({ type: MiddlewareType.CLASS, rep: middleware })
      } else if (isHttpMiddleware(middleware)) {
        this._middleware.push({ type: MiddlewareType.HTTP, rep: middleware })
      }
    }
  }

  public mount(routers: Router | Router[], options: MountingOptions = {}): this {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot mount any new routers")
    }

    if (!Array.isArray(routers)) {
      routers = [routers]
    }

    for (const router of routers) {
      this.subRouters.push({ router, options })
    }

    return this
  }
}

export const emptyRouter = () => {
  return new BaseRouter()
}
