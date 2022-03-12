import { HTTP_METHODS, LookupResultStatus, RouteLookupResult } from "./route-collector.model"
import { FinishedRoute, MergedRoutes } from "./router-merger"
import { PathConverter } from "../path-validator/validator"

export const resolveRoute = (path: string, method: HTTP_METHODS, routes: MergedRoutes): RouteLookupResult => {
  let status: LookupResultStatus.NOT_FOUND | LookupResultStatus.METHOD_NOT_ALLOWED = LookupResultStatus.NOT_FOUND
  let availableMethods: HTTP_METHODS[] = []
  for (const [[routeRegex, pathConverter], methodHandlers] of routes) {
    const match = path.match(routeRegex)
    if (match) {
      availableMethods = (Object.entries(methodHandlers) as [HTTP_METHODS, FinishedRoute | null][])
        .filter(([_, h]) => !!h)
        .map(([m]) => m)
      const handler = methodHandlers[method]
      if (handler) {
        return {
          status: LookupResultStatus.OK,
          executor: handler.executor,
          pipeline: handler.pipeline,
          pathParams: extractParamsFromMatch(match, pathConverter),
          availableMethods: addOptionsToResponse(availableMethods),
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
    availableMethods: addOptionsToResponse(availableMethods),
  }
}

const addOptionsToResponse = (methods: HTTP_METHODS[]): HTTP_METHODS[] => {
  if (methods.includes("OPTIONS")) return methods
  methods.push("OPTIONS")
  return methods
}

const extractParamsFromMatch = (match: RegExpMatchArray, pathConverter: PathConverter): Record<string, unknown> => {
  const convertedPathParams: Record<string, unknown> = {}
  for (const [name, converter] of Object.entries(pathConverter)) {
    convertedPathParams[name] = converter(match.groups![name])
  }
  return convertedPathParams
}
