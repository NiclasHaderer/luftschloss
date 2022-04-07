/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { ReadonlyRouteCollector, RouteCollectorImpl, saveObject, withDefaults } from "../core"
import {
  HttpMiddlewareRepresentation,
  isClassMiddleware,
  isHttpMiddleware,
  MiddleWareInterceptor,
  MiddlewareRepresentation,
  MiddlewareType,
  ReadonlyMiddlewares,
} from "../middleware"
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

  public mount(routers: Router | Router[], options: Partial<MountingOptions> = saveObject()): this {
    const completeOptions = withDefaults<MountingOptions>(options, { basePath: "" })

    if (this.locked) {
      throw new Error("Router has been locked. You cannot mount any new routers")
    }

    if (!Array.isArray(routers)) {
      routers = [routers]
    }

    for (const router of routers) {
      this.subRouters.push({ router, options: completeOptions })
    }

    return this
  }

  public unPipe(...middlewareList: MiddleWareInterceptor[]): this {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot remove a middleware")
    }

    for (const middleware of middlewareList) {
      let middlewareIndex = -1

      if (isClassMiddleware(middleware)) {
        middlewareIndex = this._middleware
          .filter(m => m.type === MiddlewareType.CLASS)
          .findIndex(value => value.rep.constructor.name === middleware.constructor.name)
      } else if (isHttpMiddleware(middleware)) {
        middlewareIndex = this._middleware
          .filter((m): m is HttpMiddlewareRepresentation => m.type === MiddlewareType.HTTP)
          .findIndex(value => value.rep.name === middleware.name)
      }

      if (middlewareIndex === -1) {
        console.warn("Middleware was not found and therefore could not be removed")
      } else {
        this._middleware.splice(middlewareIndex - 1, 1)
      }
    }

    return this
  }
}

export const emptyRouter = (): BaseRouter => new BaseRouter()
