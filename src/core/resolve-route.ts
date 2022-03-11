import { HTTP_METHODS, LookupResultStatus, RouteLookupResult } from "./route-collector.model"
import { MergedRoutes } from "./router-merger"
import { PathConverter } from "../path-validator/validator"

export const resolveRoute = (path: string, method: HTTP_METHODS, routes: MergedRoutes): RouteLookupResult => {
  let status: LookupResultStatus.NOT_FOUND | LookupResultStatus.METHOD_NOT_ALLOWED = LookupResultStatus.NOT_FOUND
  for (const [[routeRegex, pathConverter], methodHandlers] of routes) {
    const match = path.match(routeRegex)
    if (match) {
      const handler = methodHandlers[method]
      if (handler) {
        return {
          status: LookupResultStatus.OK,
          executor: handler.executor,
          pipeline: handler.pipeline,
          pathParams: extractParamsFromMatch(match, pathConverter),
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
  }
}

const extractParamsFromMatch = (match: RegExpMatchArray, pathConverter: PathConverter): Record<string, unknown> => {
  const convertedPathParams: Record<string, unknown> = {}
  for (const [name, converter] of Object.entries(pathConverter)) {
    convertedPathParams[name] = converter(match.groups![name])
  }
  return convertedPathParams
}
