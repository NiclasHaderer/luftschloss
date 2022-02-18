import { HTTP_METHODS, ROUTE_HANDLER } from "../interfaces/http"
import {
  isClassMiddleware,
  isHttpMiddleware,
  MiddleWareInterceptor,
  MiddlewareRepresentation,
  MiddlewareType,
} from "../interfaces/middleware"
import {
  ReadonlyRoutingController,
  RouteHandler,
  RouteLookupResult,
  RouteRetrieval,
  RoutingController,
  SuccessfulRouteLookupResult,
} from "../interfaces/routing-controller"

type StoredRoutes = Record<HTTP_METHODS, Omit<SuccessfulRouteLookupResult, "type"> | null>

export class RouteingControllerImpl implements RoutingController {
  private _collection = new Map<string, StoredRoutes>()
  private _middleware: MiddlewareRepresentation[] = []

  public get middleware(): MiddlewareRepresentation[] {
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

  public add(path: string, method: HTTP_METHODS | "*", callback: ROUTE_HANDLER): void {
    path = RouteingControllerImpl.normalize(path)

    if (method === "*") {
      Object.values(HTTP_METHODS).forEach(m => {
        this._addToCollection(path, m, callback)
      })
    } else {
      this._addToCollection(path, method, callback)
    }
  }

  public addMany(routes: ReadonlyRoutingController, basePath: string): void {
    basePath = RouteingControllerImpl.normalize(basePath)
    for (const route of routes) {
      let path = RouteingControllerImpl.normalize(route.path)
      path = RouteingControllerImpl.normalize(`${basePath}${path}`)
      this._addToCollection(path, route.method, route.route.executor, route.route.pipeline)
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

  public retrieve(path: string, method: HTTP_METHODS): RouteLookupResult {
    path = RouteingControllerImpl.normalize(path)
    if (!this._collection.has(path)) return { type: RouteRetrieval.NOT_FOUND, executor: null, pipeline: null }
    const route = this._collection.get(path)!
    const executor = route[method]
    if (!executor) return { type: RouteRetrieval.METHOD_NOT_ALLOWED, executor: null, pipeline: null }
    return { type: RouteRetrieval.OK, executor: executor.executor, pipeline: executor.pipeline }
  }

  private _addToCollection(
    path: string,
    method: HTTP_METHODS,
    callback: ROUTE_HANDLER,
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
