import {
  isClassMiddleware,
  isHttpMiddleware,
  MiddleWareInterceptor,
  MiddlewareRepresentation,
  MiddlewareType,
} from "../middleware/middleware"
import {
  CollectionEntry,
  HTTP_METHODS,
  LookupResultStatus,
  ReadonlyRouteCollector,
  ROUTE_HANDLER,
  RouteCollector,
  RouteLookupResult,
  SuccessfulRouteLookupResult,
} from "./route-collector.model"
import { NOTIMP } from "dns"

type HttpRouteCollection = Record<HTTP_METHODS, Omit<SuccessfulRouteLookupResult, "status"> | null>
type PathEntry =
  | { children: RouteCollection; handler: HttpRouteCollection; isWildcard: false; wildcardParser: null }
  | { children: RouteCollection; handler: HttpRouteCollection; isWildcard: true; wildcardParser: string }
type RouteCollection = Map<string, PathEntry>

export class RouteCollectorImpl implements RouteCollector {
  private _collection: RouteCollection = new Map<string, PathEntry>()
  private _middleware: MiddlewareRepresentation[] = []

  public get middleware(): MiddlewareRepresentation[] {
    return this._middleware
  }

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

  public [Symbol.iterator](): { next: () => { done: boolean; value: CollectionEntry } } {
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
    path = RouteCollectorImpl.normalize(path)

    if (method === "*") {
      Object.values(HTTP_METHODS).forEach(m => {
        this.addToCollection(path, m, callback)
      })
    } else {
      this.addToCollection(path, method, callback)
    }
  }

  public addMany(routes: ReadonlyRouteCollector, basePath: string): void {
    basePath = RouteCollectorImpl.normalize(basePath)
    for (const route of routes) {
      let path = RouteCollectorImpl.normalize(route.path)
      path = RouteCollectorImpl.normalize(`${basePath}${path}`)
      this.addToCollection(path, route.method, route.route.executor, route.route.pipeline)
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
    const route = this.walkUrlTree(path, false)
    if (!route) return { status: LookupResultStatus.NOT_FOUND, executor: null, pipeline: null }
    const executor = route.handler[method]
    if (!executor) return { status: LookupResultStatus.METHOD_NOT_ALLOWED, executor: null, pipeline: null }
    return {
      status: LookupResultStatus.OK,
      executor: executor.executor,
      pipeline: [...this._middleware, ...executor.pipeline],
    }
  }

  private addToCollection(
    path: string,
    method: HTTP_METHODS,
    callback: ROUTE_HANDLER,
    pipeline: Iterable<MiddlewareRepresentation> = []
  ): void {
    throw new Error("Not implemented")
    // TODO add to a collection
  }

  private walkUrlTree<T extends boolean>(
    url: string,
    createIfNotExist: T
  ): T extends true ? PathEntry : PathEntry | null {
    url = RouteCollectorImpl.normalize(url)
    const accessorList = RouteCollectorImpl.toAccessor(url)
    throw new Error("Not implemented")

    // TODO walk to the end
    return null as T extends true ? PathEntry : PathEntry | null
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

  private static toAccessor(
    url: string
  ): (
    | { path: string; isWildcard: false }
    | { path: string; isWildcard: true; pathKey: string; extractor: string | null }
  )[] {
    const isWildcard = /^{.*}$/
    const extractorR = /{.*:(.*)}/
    const pathR = /{(.*):?.*}/

    return url
      .split("/")
      .filter(path => !!path)
      .map(path => {
        const extractorMatch = path.match(extractorR)
        const extractor = extractorMatch ? extractorMatch[1] : null

        const pathMatch = path.match(pathR)
        const pathKey = pathMatch ? pathMatch[1] : null
        return {
          path,
          pathKey,
          extractor,
          isWildcard: isWildcard.test(path),
        } as
          | { path: string; isWildcard: false }
          | { path: string; isWildcard: true; pathKey: string; extractor: string | null }
      })
  }
}
