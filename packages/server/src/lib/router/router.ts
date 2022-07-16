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
import { PathValidator } from "../path-validator"

export interface MountingOptions {
  basePath: string
}

export interface Router {
  children: Readonly<{ router: Router; options: MountingOptions }[]>
  routes: ReadonlyRouteCollector
  readonly middlewares: ReadonlyMiddlewares
  readonly locked: boolean
  readonly parentRouter: Router | undefined
  readonly server: ServerBase | undefined
  readonly path: string | undefined
  readonly completePath: string | undefined

  onMount(server: ServerBase, parentRouter: Router, completePath: string): void

  mount(router: Router[] | Router, options?: Partial<MountingOptions>): this

  pipe(...middleware: Middleware[]): this

  unPipe(...middleware: Middleware[]): this

  addPathValidator(validator: PathValidator<unknown>): this

  removePathValidator(validatorOrName: PathValidator<unknown> | PathValidator<unknown>["name"]): this

  lock(): void
}
