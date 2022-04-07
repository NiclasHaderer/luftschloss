/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

/**
 * Every router has to expose a list of middlewares the callbacks in the routes' property will be wrapped in
 */
import { ReadonlyRouteCollector } from "../core"
import { MiddleWareInterceptor, ReadonlyMiddlewares } from "../middleware"

export interface MountingOptions {
  basePath: string
}

export interface Router {
  children: Readonly<{ router: Router; options: MountingOptions }[]>
  routes: ReadonlyRouteCollector

  readonly middleware: ReadonlyMiddlewares
  readonly locked: boolean

  mount(router: Router[] | Router, options?: MountingOptions): this

  pipe(...middleware: MiddleWareInterceptor[]): this
  unPipe(...middleware: MiddleWareInterceptor[]): this

  lock(): void
}
