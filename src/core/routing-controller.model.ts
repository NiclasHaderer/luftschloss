import { MiddlewareRepresentation } from "../middleware/middleware"
import { RequestImpl } from "./request"
import { ResponseImpl } from "./response"

export enum RouteRetrieval {
  NOT_FOUND,
  METHOD_NOT_ALLOWED,
  OK,
}

export type SuccessfulRouteLookupResult = {
  executor: ROUTE_HANDLER
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

export interface ReadonlyRoutingController extends Iterable<RouteHandler> {
  retrieve(path: string, method: HTTP_METHODS): RouteLookupResult
}

export interface RoutingController extends ReadonlyRoutingController {
  middleware: Iterable<MiddlewareRepresentation>

  add(path: string, method: HTTP_METHODS | "*", callback: ROUTE_HANDLER): void

  addMany(routes: RoutingController, basePath: string): void
}

export type HTTP_METHODS = "GET" | "POST" | "DELETE" | "PUT" | "PATCH"
export const HTTP_METHODS: Record<HTTP_METHODS, HTTP_METHODS> = {
  DELETE: "DELETE",
  GET: "GET",
  PATCH: "PATCH",
  POST: "POST",
  PUT: "PUT",
}
export type ROUTE_HANDLER = (request: RequestImpl, response: ResponseImpl) => Promise<any> | any
