import {
  isClassMiddleware,
  isHttpMiddleware,
  MiddleWareInterceptor,
  MiddlewareRepresentation,
  MiddlewareType,
} from "../middleware/middleware"
import {
  BaseRouteCollector,
  CollectionEntry,
  HTTP_METHODS,
  ROUTE_HANDLER,
  RouteCollector,
  SuccessfulRouteLookupResult,
} from "./route-collector.model"

type HttpRouteCollection = Record<HTTP_METHODS, Omit<SuccessfulRouteLookupResult, "status"> | null>
export type PathEntry =
  | { children: RouteCollection; handler: HttpRouteCollection | null; isWildcard: false; wildcardParser: null }
  | { children: RouteCollection; handler: HttpRouteCollection | null; isWildcard: true; wildcardParser: string }
export type RouteCollection = Map<string, PathEntry>

export class RouteCollectorImpl extends BaseRouteCollector implements RouteCollector {
  private _collection: RouteCollection = new Map<string, PathEntry>()
  private _middleware: MiddlewareRepresentation[] = []

  private get handlers(): CollectionEntry[] {
    return [...this._collection.entries()].flatMap(([path, routeHandler]) =>
      Object.entries(routeHandler)
        .filter(([_, handler]) => !!handler)
        .map(
          ([method, handler]) =>
            ({
              method,
              path,
              route: handler,
            } as CollectionEntry)
        )
    )
  }

  public entries(): Iterator<CollectionEntry> {
    const handlers = this.handlers
    const handlerCount = handlers.length
    let counter = -1

    return {
      next: (): { done: boolean; value: CollectionEntry } => {
        counter += 1
        const done = counter >= handlerCount
        const handler = handlers[counter]
        return {
          done,
          value: handler
            ? {
                ...handler,
                route: {
                  ...handler.route,
                  // Merge the route pipeline with the middleware associated to the route collection
                  pipeline: [...this._middleware, ...handler.route.pipeline],
                },
              }
            : handler,
        }
      },
    }
  }

  public add(path: string, method: HTTP_METHODS | "*", callback: ROUTE_HANDLER): void {
    if (method === "*") {
      Object.values(HTTP_METHODS).forEach(m => {
        this.addToCollection(path, m, callback)
      })
    } else {
      this.addToCollection(path, method, callback)
    }
  }

  public addMiddleware(...middlewareList: MiddleWareInterceptor[]): void {
    for (const middleware of middlewareList) {
      if (isClassMiddleware(middleware)) {
        this._middleware.push({ type: MiddlewareType.CLASS, rep: middleware })
      } else if (isHttpMiddleware(middleware)) {
        this._middleware.push({ type: MiddlewareType.HTTP, rep: middleware })
      }
    }
  }

  private addToCollection(path: string, method: HTTP_METHODS, callback: ROUTE_HANDLER): void {
    // TODO
  }
}
