import {
  HTTP_METHODS,
  LookupResultStatus,
  PathValidator,
  RetrievableRouteCollector,
  RouteLookupResult,
} from "./route-collector.model"
import { Router } from "./router.model"
import { PathEntry, RouteCollection } from "./route-collector"

export class RouteCollectorWrapper implements RetrievableRouteCollector {
  private _collection: RouteCollection = new Map<string, PathEntry>()

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
