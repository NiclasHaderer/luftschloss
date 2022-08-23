/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { saveObject } from "@luftschloss/common"
import type { MergedRoutes } from "./route-collector"
import { HTTP_METHODS, LookupResultStatus, ROUTE_HANDLER, RouteLookupResult } from "./route-collector.model"

/**
 * Resolve a route
 * @param path The complete path of the request
 * @param method The method of the request
 * @param routes The routes which can be resolved. The lookup routes will be used first and only if no lookup route
 * matches the regex routes will be tried out
 * @returns A lookup-result which indicates if the lookup was successful
 */
export const resolveRoute = (path: string, method: HTTP_METHODS, routes: MergedRoutes): RouteLookupResult => {
  let status: LookupResultStatus.NOT_FOUND | LookupResultStatus.METHOD_NOT_ALLOWED = LookupResultStatus.NOT_FOUND
  let availableMethods: HTTP_METHODS[] = []

  if (path in routes.lookup) {
    const endpoint = routes.lookup[path]
    const handler = endpoint[method]
    availableMethods = getAvailableMethods(endpoint)

    if (handler) {
      return {
        status: LookupResultStatus.OK,
        executor: handler,
        pathParams: saveObject(),
        availableMethods,
      }
    } else {
      status = LookupResultStatus.METHOD_NOT_ALLOWED
    }
  }

  for (const [routeRegex, endpoint] of routes.regex) {
    const match = path.match(routeRegex)
    if (match) {
      const handler = endpoint[method]
      availableMethods = getAvailableMethods(endpoint)
      if (handler) {
        return {
          status: LookupResultStatus.OK,
          executor: handler,
          pathParams: extractParamsFromMatch(match),
          availableMethods,
        }
      } else {
        status = LookupResultStatus.METHOD_NOT_ALLOWED
      }
    }
  }
  return {
    status,
    availableMethods,
  }
}

/**
 * Get the available methods of a route
 * @param endpoint The route endpoint which should be queried for available methods
 * @returns The available methods of the route
 */
export const getAvailableMethods = (endpoint: Record<HTTP_METHODS, ROUTE_HANDLER | null>) => {
  const notNullMethods = (Object.entries(endpoint) as [HTTP_METHODS, ROUTE_HANDLER | null][])
    .filter(([, h]) => !!h)
    .map(([m]) => m)
  if (notNullMethods.includes("OPTIONS")) return notNullMethods
  notNullMethods.push("OPTIONS")
  return notNullMethods
}

/**
 * Checks if the route matching regex has some *named* capture groups and if yes extract the params from that match
 * @param match The regex match
 */
export const extractParamsFromMatch = (match: RegExpMatchArray): Record<string, unknown> => {
  return {
    ...(match.groups || {}),
  }
}
