import { HTTP_HANDLER, HTTP_METHODS } from "../types/http"
import { Middleware, MiddlewareRepresentation } from "../types/middleware"
import { MiddlewareImpl } from "./middleware"
import {
  ReadonlyRouteCollector,
  RouteCollector,
  RouteHandler,
  RouteLookupResult,
  RouteRetrieval,
  SuccessfulRouteLookupResult,
} from "../types/route-controller"

type StoredRoutes = Record<HTTP_METHODS, Omit<SuccessfulRouteLookupResult, "type"> | null>

export class RouteCollectorImpl implements RouteCollector {
  private _collection = new Map<string, StoredRoutes>()
  private _middleware = new MiddlewareImpl()

  public get middleware(): Middleware {
    return this._middleware
  }

  private get handlers(): RouteHandler[] {
    return [...this._collection.entries()].flatMap(([path, routeHandler]) =>
      Object.entries(routeHandler)
        .filter(([_, handler]) => !!handler)
        .map(
          ([method, handler]) =>
            ({
              method,
              path,
              route: handler,
            } as RouteHandler)
        )
    )
  }

  public [Symbol.iterator](): { next: () => { done: boolean; value: RouteHandler } } {
    const handlers = this.handlers
    const handlerCount = handlers.length
    let counter = -1

    return {
      next: (): { done: boolean; value: RouteHandler } => {
        counter += 1
        const done = counter >= handlerCount
        return {
          done,
          value: handlers[counter],
        }
      },
    }
  }

  public add(path: string, method: HTTP_METHODS | "*", callback: HTTP_HANDLER): this {
    path = RouteCollectorImpl.normalize(path)

    if (method === "*") {
      Object.values(HTTP_METHODS).forEach(m => {
        this._addToCollection(path, m, callback)
      })
    } else {
      this._addToCollection(path, method, callback)
    }

    return this
  }

  public addMany(routes: ReadonlyRouteCollector, basePath: string): this {
    basePath = RouteCollectorImpl.normalize(basePath)
    for (const route of routes) {
      let path = RouteCollectorImpl.normalize(route.path)
      path = RouteCollectorImpl.normalize(`${basePath}${path}`)
      this._addToCollection(path, route.method, route.route.executor, route.route.pipeline)
    }

    return this
  }

  public retrieve(path: string, method: HTTP_METHODS): RouteLookupResult {
    path = RouteCollectorImpl.normalize(path)
    if (!this._collection.has(path)) return { type: RouteRetrieval.NOT_FOUND, executor: null, pipeline: null }
    const route = this._collection.get(path)!
    const executor = route[method]
    if (!executor) return { type: RouteRetrieval.METHOD_NOT_ALLOWED, executor: null, pipeline: null }
    return { type: RouteRetrieval.OK, executor: executor.executor, pipeline: executor.pipeline }
  }

  private _addToCollection(
    path: string,
    method: HTTP_METHODS,
    callback: HTTP_HANDLER,
    pipeline: Iterable<MiddlewareRepresentation> = []
  ): void {
    if (!this._collection.has(path)) {
      this._collection.set(path, { GET: null, DELETE: null, PATCH: null, POST: null, PUT: null })
    }
    const route = this._collection.get(path)!
    if (route[method] !== null) {
      throw new Error(`Route ${path} as already a listener for the method ${method}`)
    }
    route[method] = { executor: callback, pipeline: [...this.middleware, ...pipeline] }
  }

  private static normalize(url: string): string {
    if (!url.startsWith("/")) {
      url = `/${url}`
    }
    if (!url.endsWith("/")) {
      url += "/"
    }
    // Replace // with /
    return url.replaceAll("//", "/")
  }
}
