/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

/**
 * Every router has to expose a list of middlewares the callbacks in the routes' property will be wrapped in
 */
import { ReadonlyRouteCollector, ServerBase } from "../core"
import { Middleware, ReadonlyMiddlewares } from "../middleware"

export interface MountingOptions {
  basePath: string
}

export interface Router {
  children: Readonly<{ router: Router; options: MountingOptions }[]>
  routes: ReadonlyRouteCollector
  readonly middlewares: ReadonlyMiddlewares
  readonly locked: boolean

  onMount?(server: ServerBase): void

  mount(router: Router[] | Router, options?: MountingOptions): this

  pipe(...middleware: Middleware[]): this

  unPipe(...middleware: Middleware[]): this

  lock(): void
}
