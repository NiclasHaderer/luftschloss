import { HTTP_METHODS, ROUTE_HANDLER } from "./http"
import { MiddleWareInterceptor, MiddlewareRepresentation } from "./middleware"
import { ReadonlyRoutingController } from "./routing-controller"

export interface MountingOptions {
  basePath?: string
}

export interface Router {
  readonly middleware: Iterable<MiddlewareRepresentation>
  readonly routes: ReadonlyRoutingController

  delete(url: string, callback: ROUTE_HANDLER): void

  get(url: string, callback: ROUTE_HANDLER): void

  handle(method: HTTP_METHODS | "*", url: string, callback: ROUTE_HANDLER): void

  mount(router: Router | Router[], options: MountingOptions): this

  patch(url: string, callback: ROUTE_HANDLER): void

  pipe(...middleware: MiddleWareInterceptor[]): this

  post(url: string, callback: ROUTE_HANDLER): void

  put(url: string, callback: ROUTE_HANDLER): void
}
