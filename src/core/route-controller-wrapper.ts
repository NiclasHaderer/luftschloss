import {
  HTTP_METHODS,
  LookupResultStatus,
  PathValidator,
  RetrievableRouteCollector,
  RouteLookupResult,
  SuccessfulRouteLookupResult,
} from "./route-collector.model"
import { Router } from "./router.model"

type HttpRouteCollection = Record<HTTP_METHODS, Omit<SuccessfulRouteLookupResult, "status"> | null>
type PathEntry =
  | { children: RouteCollection; handler: HttpRouteCollection; isWildcard: false; wildcardParser: null }
  | { children: RouteCollection; handler: HttpRouteCollection; isWildcard: true; wildcardParser: string }
type RouteCollection = Map<string, PathEntry>

export class RouteCollectorWrapper implements RetrievableRouteCollector {
  public retrieve(path: string, method: HTTP_METHODS): RouteLookupResult {
    // TODO
    return { status: LookupResultStatus.NOT_FOUND, executor: null, pipeline: null }
  }

  public mergeIn(routers: Router): void {
    // TODO
  }

  public addPathValidator(validator: PathValidator<any>): this {
    return this
  }
}
