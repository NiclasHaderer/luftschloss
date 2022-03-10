import { HTTP_METHODS, LookupResultStatus, RouteLookupResult } from "./route-collector.model"
import { MergedRoutes } from "./router-merger"

export const resolveRoute = (path: string, method: HTTP_METHODS, routes: MergedRoutes): RouteLookupResult => {
  let status: LookupResultStatus.NOT_FOUND | LookupResultStatus.METHOD_NOT_ALLOWED = LookupResultStatus.NOT_FOUND
  for (const [routeRegex, methodHandlers] of routes) {
    if (routeRegex.test(path)) {
      const handler = methodHandlers[method]
      if (handler) {
        return {
          status: LookupResultStatus.OK,
          executor: handler.executor,
          pipeline: handler.pipeline,
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
  }
}
