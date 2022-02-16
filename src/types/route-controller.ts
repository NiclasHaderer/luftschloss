import { HTTP_HANDLER, HTTP_METHODS } from "./http"
import { Middleware, MiddlewareRepresentation } from "./middleware"

export enum RouteRetrieval {
  NOT_FOUND,
  METHOD_NOT_ALLOWED,
  OK,
}

export type SuccessfulRouteLookupResult = {
  executor: HTTP_HANDLER
  pipeline: Iterable<MiddlewareRepresentation>
  type: RouteRetrieval.OK
}
export type UnSuccessfulRouteLookupResult = {
  executor: null
  pipeline: null
  type: RouteRetrieval.METHOD_NOT_ALLOWED | RouteRetrieval.NOT_FOUND
}
export type RouteLookupResult = UnSuccessfulRouteLookupResult | SuccessfulRouteLookupResult
export type RouteHandler = { method: HTTP_METHODS; path: string; route: Omit<SuccessfulRouteLookupResult, "type"> }

export interface ReadonlyRouteCollector extends Iterable<RouteHandler> {
  retrieve(path: string, method: HTTP_METHODS): RouteLookupResult
}

export interface RouteCollector extends ReadonlyRouteCollector {
  middleware: Middleware
  add(path: string, method: HTTP_METHODS | "*", callback: HTTP_HANDLER): this

  addMany(routes: RouteCollector, basePath: string): this
}
