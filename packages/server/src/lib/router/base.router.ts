/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { saveObject, withDefaults } from "@luftschloss/core"
import { ReadonlyRouteCollector, RouteCollectorImpl } from "../core"
import { Middleware, ReadonlyMiddlewares } from "../middleware"
import { MountingOptions, Router } from "./router"

export class BaseRouter implements Router {
  protected readonly subRouters: { router: Router; options: MountingOptions }[] = []
  protected readonly _routeCollector = new RouteCollectorImpl()
  protected _middlewares: Middleware[] = []
  protected _locked = false

  public get children(): { router: Router; options: MountingOptions }[] {
    return this.subRouters
  }

  public get locked(): boolean {
    return this._locked
  }

  public get middlewares(): ReadonlyMiddlewares {
    return this._middlewares
  }

  public get routes(): ReadonlyRouteCollector {
    return this._routeCollector
  }

  public lock(): void {
    this._locked = true
    this.subRouters.map(r => r.router).forEach(r => r.lock())
  }

  public pipe(...middleware: Middleware[]): this {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot add a new middleware")
    }

    this.addMiddleware(...middleware)
    return this
  }

  // TODO create something like pipeOnly to be able to add a middleware which will only able to be used by one handler.

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

  public unPipe(...middlewaresToRemove: Middleware[]): this {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot remove a middleware")
    }

    // Reverse the middleware list to remove the last middleware with the name that was added
    const reversedMiddlewares = this._middlewares.reverse()
    for (const middleware of middlewaresToRemove) {
      const middlewareIndex = reversedMiddlewares.findIndex(m => m.name === middleware.name)

      if (middlewareIndex === -1) {
        console.warn("Middleware was not found and therefore could not be removed.")
      } else {
        this._middlewares.splice(middlewareIndex - 1, 1)
      }
    }

    return this
  }

  protected addMiddleware(...middlewareList: Middleware[]): void {
    for (const middleware of middlewareList) {
      this._middlewares.push(middleware)
      // TODO call lifecycle hooks
    }
  }
}

export const emptyRouter = (): BaseRouter => new BaseRouter()
