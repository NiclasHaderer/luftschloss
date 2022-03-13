import { PathConverter } from "../path-validator/validator"
import { HTTP_METHODS, LookupResultStatus, RouteLookupResult } from "./route-collector.model"
import { FinishedRoute, MergedRoutes } from "./router-merger"

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
        executor: handler.executor,
        pipeline: handler.pipeline,
        pathParams: {},
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
          executor: handler.executor,
          pipeline: handler.pipeline,
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
    pipeline: null,
    executor: null,
    pathParams: null,
    availableMethods,
  }
}

const getAvailableMethods = (endpoint: Record<HTTP_METHODS, FinishedRoute | null>) => {
  const notNullMethods = (Object.entries(endpoint) as [HTTP_METHODS, FinishedRoute | null][])
    .filter(([_, h]) => !!h)
    .map(([m]) => m)
  if (notNullMethods.includes("OPTIONS")) return notNullMethods
  notNullMethods.push("OPTIONS")
  return notNullMethods
}

const extractParamsFromMatch = (match: RegExpMatchArray, pathConverter: PathConverter): Record<string, unknown> => {
  const convertedPathParams: Record<string, unknown> = {}
  for (const [name, converter] of Object.entries(pathConverter)) {
    convertedPathParams[name] = converter(match.groups![name])
  }
  return convertedPathParams
}
