/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { LRequest } from "./request";
import { LResponse } from "./response";

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
  executor: ROUTE_HANDLER;
  pathParams: Record<string, unknown>;
  status: LookupResultStatus.OK;
  availableMethods: HTTP_METHODS[];
};

export type RouteNotFoundLookupResult = {
  status: LookupResultStatus.NOT_FOUND;
  availableMethods: HTTP_METHODS[];
};

export type MethodNotAllowedLookupResult = {
  status: LookupResultStatus.METHOD_NOT_ALLOWED;
  availableMethods: HTTP_METHODS[];

  pathParams: Record<string, unknown>;
};

/**
 * Type of a unsuccessful route retrieval
 */
export type UnSuccessfulRouteLookupResult = RouteNotFoundLookupResult | MethodNotAllowedLookupResult;

/**
 * Route lookup result
 */
export type RouteLookupResult = UnSuccessfulRouteLookupResult | SuccessfulRouteLookupResult;

/**
 * The callback which gets registered to the collector
 */
export type ROUTE_HANDLER = (request: LRequest, response: LResponse) => Promise<unknown> | unknown;

/**
 * Available HTTP_METHODS To listen for
 */
export type HTTP_METHODS = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "TRACE" | "PATCH";
export const HTTP_METHODS: Record<HTTP_METHODS, HTTP_METHODS> = {
  TRACE: "TRACE",
  DELETE: "DELETE",
  GET: "GET",
  HEAD: "HEAD",
  PATCH: "PATCH",
  POST: "POST",
  PUT: "PUT",
  OPTIONS: "OPTIONS",
};
