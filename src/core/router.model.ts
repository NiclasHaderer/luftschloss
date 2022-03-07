/**
 * Every router has to expose a list of middlewares the callbacks in the routes property will be wrapped in
 */
import { ReadonlyRouteCollector } from "./route-collector.model"
import { ReadonlyMiddlewares } from "../middleware/middleware"

export interface MountingOptions {
  basePath?: string
}

export interface Router {
  children: { router: Router; options: MountingOptions }[]
  routes: ReadonlyRouteCollector

  readonly middleware: ReadonlyMiddlewares

  mount(router: Router[] | Router, options?: MountingOptions): this

  lock(): void
}
