import { HTTP_HANDLER, HTTP_METHODS } from "./http"
import { Middleware } from "./middleware"
import { ReadonlyRouteCollector } from "./route-controller"

export interface MountingOptions {
  basePath?: string
}

export interface Router {
  readonly middleware: Middleware
  readonly routes: ReadonlyRouteCollector

  delete(url: string, callback: HTTP_HANDLER): void

  get(url: string, callback: HTTP_HANDLER): void

  handle(method: HTTP_METHODS | "*", url: string, callback: HTTP_HANDLER): void

  mount(router: Router | Router[], options: MountingOptions): this

  patch(url: string, callback: HTTP_HANDLER): void

  post(url: string, callback: HTTP_HANDLER): void

  put(url: string, callback: HTTP_HANDLER): void
}
