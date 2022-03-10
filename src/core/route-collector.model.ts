import { MiddlewareRepresentation } from "../middleware/middleware"
import { RequestImpl } from "./request"
import { ResponseImpl } from "./response"
import { PathValidator } from "../path-validator/validator"

/**
 * Indicate weather the route retrieval was successful
 */
export enum LookupResultStatus {
  NOT_FOUND,
  METHOD_NOT_ALLOWED,
  OK,
}

/**
 * Type of a successful route retrieval
 */
export type SuccessfulRouteLookupResult = {
  executor: ROUTE_HANDLER
  pipeline: Iterable<MiddlewareRepresentation>
  status: LookupResultStatus.OK
}

/**
 * Type of a unsuccessful route retrieval
 */
export type UnSuccessfulRouteLookupResult = {
  executor: null
  pipeline: null
  status: LookupResultStatus.METHOD_NOT_ALLOWED | LookupResultStatus.NOT_FOUND
}

/**
 * Route lookup result
 */
export type RouteLookupResult = UnSuccessfulRouteLookupResult | SuccessfulRouteLookupResult

/**
 * An entry with all the necessary information like attached middleware... which can be used to invoke a route handler
 */
export type CollectionEntry = { method: HTTP_METHODS; path: string; handler: ROUTE_HANDLER }

/**
 * Collector which can not be modified
 */
export interface ReadonlyRouteCollector {
  entries(): Iterable<CollectionEntry>
}

/**
 * Interface which has to be implemented by every collector which wants to bundle routes
 */
export interface RouteCollector extends ReadonlyRouteCollector {
  add(path: string, method: HTTP_METHODS | "*", callback: ROUTE_HANDLER): void
  entries(): Iterable<CollectionEntry>
}

/**
 * Adds the ability to look up a route
 */
export interface RetrievableRouteCollector {
  addPathValidator(validator: PathValidator<any>): this

  retrieve(path: string, method: HTTP_METHODS): RouteLookupResult
}

/**
 * The callback which gets registered to the collector
 */
export type ROUTE_HANDLER = (request: RequestImpl, response: ResponseImpl) => Promise<any> | any

/**
 * Available HTTP_METHODS To listen for
 */
export type HTTP_METHODS = "GET" | "POST" | "DELETE" | "PUT" | "PATCH"
export const HTTP_METHODS: Record<HTTP_METHODS, HTTP_METHODS> = {
  DELETE: "DELETE",
  GET: "GET",
  PATCH: "PATCH",
  POST: "POST",
  PUT: "PUT",
}
