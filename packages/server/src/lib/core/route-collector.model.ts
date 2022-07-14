/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { Middleware } from "../middleware"
import { PathValidator } from "../path-validator"
import { LRequest } from "./request"
import { LResponse } from "./response"

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
  pathParams: Record<string, unknown>
  pipeline: Iterable<Middleware>
  status: LookupResultStatus.OK
  availableMethods: HTTP_METHODS[]
}

/**
 * Type of a unsuccessful route retrieval
 */
export type UnSuccessfulRouteLookupResult = {
  executor: null
  pipeline: null
  pathParams: null
  status: LookupResultStatus.METHOD_NOT_ALLOWED | LookupResultStatus.NOT_FOUND
  availableMethods: HTTP_METHODS[]
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
  addPathValidator(validator: PathValidator<unknown>): this

  retrieve(path: string, method: HTTP_METHODS): RouteLookupResult
}

/**
 * The callback which gets registered to the collector
 */
export type ROUTE_HANDLER = (request: LRequest, response: LResponse) => Promise<unknown> | unknown

/**
 * Available HTTP_METHODS To listen for
 */
export type HTTP_METHODS = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "TRACE" | "PATCH"
export const HTTP_METHODS: Record<HTTP_METHODS, HTTP_METHODS> = {
  TRACE: "TRACE",
  DELETE: "DELETE",
  GET: "GET",
  HEAD: "HEAD",
  PATCH: "PATCH",
  POST: "POST",
  PUT: "PUT",
  OPTIONS: "OPTIONS",
}
