import {
  CollectionEntry,
  HTTP_METHODS,
  LookupResultStatus,
  ReadonlyRouteCollector,
  RouteLookupResult,
  SuccessfulRouteLookupResult,
} from "./route-collector.model"
import { Router } from "./router.model"

type HttpRouteCollection = Record<HTTP_METHODS, Omit<SuccessfulRouteLookupResult, "status"> | null>
type PathEntry =
  | { children: RouteCollection; handler: HttpRouteCollection; isWildcard: false; wildcardParser: null }
  | { children: RouteCollection; handler: HttpRouteCollection; isWildcard: true; wildcardParser: string }
type RouteCollection = Map<string, PathEntry>

export class RouteCollectorWrapper implements ReadonlyRouteCollector {
  public [Symbol.iterator](): Iterator<CollectionEntry> {
    return {
      next(...args): IteratorResult<CollectionEntry, any> {
        return {
          done: true,
          value: null as any,
        }
      },
    }
  }

  public retrieve(path: string, method: HTTP_METHODS): RouteLookupResult {
    return { status: LookupResultStatus.NOT_FOUND, executor: null, pipeline: null }
  }

  public mergeIn(routers: Router): void {
    // TODO iterate over every router and collect the paths, and the sub paths of the router
  }
}
