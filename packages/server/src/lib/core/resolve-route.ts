/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { saveObject } from "@luftschloss/core"
import { PathConverter } from "../path-validator"
import { HTTP_METHODS, LookupResultStatus, ROUTE_HANDLER, RouteLookupResult } from "./route-collector.model"
import type { MergedRoutes } from "./route-collector"

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

  for (const [[routeRegex, pathConverter], endpoint] of routes.regex) {
    const match = path.match(routeRegex)
    if (match) {
      const handler = endpoint[method]
      availableMethods = getAvailableMethods(endpoint)
      if (handler) {
        return {
          status: LookupResultStatus.OK,
          executor: handler,
          pathParams: extractParamsFromMatch(match, pathConverter),
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

export const getAvailableMethods = (endpoint: Record<HTTP_METHODS, ROUTE_HANDLER | null>) => {
  const notNullMethods = (Object.entries(endpoint) as [HTTP_METHODS, ROUTE_HANDLER | null][])
    .filter(([, h]) => !!h)
    .map(([m]) => m)
  if (notNullMethods.includes("OPTIONS")) return notNullMethods
  notNullMethods.push("OPTIONS")
  return notNullMethods
}

export const extractParamsFromMatch = (
  match: RegExpMatchArray,
  pathConverter: PathConverter
): Record<string, unknown> => {
  const convertedPathParams: Record<string, unknown> = saveObject()
  for (const [name, converter] of Object.entries(pathConverter)) {
    convertedPathParams[name] = converter(match.groups![name])
  }
  return convertedPathParams
}
