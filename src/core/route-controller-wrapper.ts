import {
  HTTP_METHODS,
  LookupResultStatus,
  PathValidator,
  RetrievableRouteCollector,
  ROUTE_HANDLER,
  RouteLookupResult,
} from "./route-collector.model"
import { MountingOptions, Router } from "./router.model"
import { ReadonlyMiddlewares } from "../middleware/middleware"

type FinishedRoute = {
  pipeline: ReadonlyMiddlewares
  executor: ROUTE_HANDLER
}

export class RouteCollectorWrapper implements RetrievableRouteCollector {
  private _collection = new Map<string, Record<HTTP_METHODS, FinishedRoute | null>>()
  private routes: { matchString: RegExp; method: HTTP_METHODS; route: FinishedRoute }[] = []

  public retrieve(path: string, method: HTTP_METHODS): RouteLookupResult {
    // TODO
    return { status: LookupResultStatus.NOT_FOUND, executor: null, pipeline: null }
  }

  public mergeIn(router: Router, { basePath }: MountingOptions, parentPipeline: ReadonlyMiddlewares): void {
    for (let { handler, path, method } of router.routes.entries()) {
      path = `${basePath}/${path}`.replaceAll("//", "/")
      if (!this._collection.has(path)) {
        this._collection.set(path, { DELETE: null, GET: null, PATCH: null, POST: null, PUT: null })
      }
      const collection = this._collection.get(path)!
      if (collection[method as HTTP_METHODS]) {
        throw new Error(`Route ${path} already has a handler registered. Registering handlers twice is not possible`)
      }

      collection[method as HTTP_METHODS] = {
        executor: handler,
        pipeline: [...parentPipeline, ...router.middleware],
      }
    }

    for (const { router: childRouter, options } of router.children) {
      this.mergeIn(childRouter, options, [...parentPipeline, ...router.middleware])
    }
  }

  public addPathValidator(validator: PathValidator<any>): this {
    // TODO
    return this
  }

  public lock(): void {
    // TODO
  }
}
