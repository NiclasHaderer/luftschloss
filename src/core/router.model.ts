/**
 * Every router has to expose a list of middlewares the callbacks in the routes property will be wrapped in
 */
import { ReadonlyRouteCollector } from "./route-collector.model"

export interface MountingOptions {
  basePath?: string
}

export interface Router {
  children: { router: Router; options: MountingOptions }[]
  routes: ReadonlyRouteCollector

  mount(router: Router[] | Router, options?: MountingOptions): this

  lock(): void
}
