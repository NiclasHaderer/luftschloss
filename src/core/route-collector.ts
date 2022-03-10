import { CollectionEntry, HTTP_METHODS, ROUTE_HANDLER, RouteCollector } from "./route-collector.model"
import { normalizePath } from "./utils"

export type HttpRouteCollection = Record<HTTP_METHODS, ROUTE_HANDLER | null>
export type RouteCollection = Map<string, HttpRouteCollection>

export class RouteCollectorImpl implements RouteCollector {
  private _collection: RouteCollection = new Map<string, HttpRouteCollection>()

  private get handlers(): CollectionEntry[] {
    return [...this._collection.entries()].flatMap(([path, routeHandler]) =>
      (Object.entries(routeHandler) as [HTTP_METHODS, ROUTE_HANDLER | null][])
        .filter(([_, handler]) => !!handler)
        .map(([method, handler]) => ({
          method,
          path,
          handler: handler as ROUTE_HANDLER,
        }))
    )
  }

  public entries(): Iterable<CollectionEntry> {
    return this.handlers
  }

  public add(path: string, method: HTTP_METHODS | "*", callback: ROUTE_HANDLER): void {
    path = normalizePath(path)
    if (method === "*") {
      Object.values(HTTP_METHODS).forEach(m => {
        this.addToCollection(path, m, callback)
      })
    } else {
      this.addToCollection(path, method, callback)
    }
  }

  private addToCollection(path: string, method: HTTP_METHODS, callback: ROUTE_HANDLER): void {
    if (!this._collection.has(path)) {
      this._collection.set(path, { DELETE: null, GET: null, PATCH: null, POST: null, PUT: null })
    }
    const collection = this._collection.get(path)!
    if (collection[method as HTTP_METHODS]) {
      throw new Error(`Route ${path} already has a handler registered. Registering handlers twice is not possible`)
    }

    collection[method as HTTP_METHODS] = callback
  }
}
