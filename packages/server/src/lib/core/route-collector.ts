/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { normalizePath, saveObject } from "@luftschloss/core"
import { HTTP_METHODS, ROUTE_HANDLER } from "./route-collector.model"
import { containsRegex, PathConverter, pathToRegex, PathValidators } from "../path-validator"

export type CollectionEntry = { method: HTTP_METHODS; path: string; handler: ROUTE_HANDLER }
type Path = string

export type MergedRoute = [[RegExp, PathConverter], Record<HTTP_METHODS, ROUTE_HANDLER | null>]
export type MergedRoutes = {
  lookup: Record<string, Record<HTTP_METHODS, ROUTE_HANDLER | null>>
  regex: ReadonlyArray<Readonly<MergedRoute>>
}

export class RouteCollector {
  private _collection = new Map<Path, Record<HTTP_METHODS, ROUTE_HANDLER | null>>()

  private locked = false
  private baseURL: string | undefined = undefined
  private pathValidators: PathValidators | undefined = undefined
  private completeCache: MergedRoutes | undefined = undefined

  public entries(): ReadonlyArray<Readonly<CollectionEntry>> {
    return [...this._collection.entries()].flatMap(([path, routeHandler]) =>
      (Object.entries(routeHandler) as [HTTP_METHODS, ROUTE_HANDLER | null][])
        .filter(([, handler]) => !!handler)
        .map(([method, handler]) => ({
          method,
          path,
          handler: handler as ROUTE_HANDLER,
        }))
    )
  }

  public completeRoutes(): MergedRoutes {
    // Complete cache can only be set if the lock has been executed successfully, so we can skip one check and return early
    if (this.completeCache) return this.completeCache

    if (!this.locked) throw new Error("Cannot retrieve routes because RouteMerger is not locked")

    const regexPaths: MergedRoute[] = []
    const lookupPaths: Record<string, Record<HTTP_METHODS, ROUTE_HANDLER | null>> = saveObject()

    for (let [path, methods] of this._collection.entries()) {
      // Concat the relative path to an absolute path which also contains the base path of the router
      path = normalizePath(`${this.baseURL}/${path}`)

      // If the route which should be handled contains a regex matcher `{hello:string}` then
      // extract the regex and compile it
      if (containsRegex(path)) {
        regexPaths.push([pathToRegex(path, this.pathValidators!), methods])
      } else {
        lookupPaths[path] = methods
      }
    }

    this.completeCache = {
      lookup: lookupPaths,
      regex: regexPaths,
    }
    return this.completeCache
  }

  public lock(baseURL: string, pathValidators: PathValidators) {
    this.locked = true
    this.baseURL = baseURL
    this.pathValidators = pathValidators
  }

  public add(path: Path, method: HTTP_METHODS | "*", callback: ROUTE_HANDLER): void {
    path = normalizePath(path)
    if (method === "*") {
      Object.values(HTTP_METHODS).forEach(m => {
        this.addToCollection(path, m, callback)
      })
    } else {
      this.addToCollection(path, method, callback)
    }
  }

  private addToCollection(path: Path, method: HTTP_METHODS, callback: ROUTE_HANDLER): void {
    if (!this._collection.has(path)) {
      this._collection.set(path, {
        TRACE: null,
        HEAD: null,
        DELETE: null,
        GET: null,
        PATCH: null,
        POST: null,
        PUT: null,
        OPTIONS: null,
      })
    }
    const collection = this._collection.get(path)!
    if (collection[method]) {
      throw new Error(
        `Route ${path} already has a handler registered. Registering route handlers twice is not possible`
      )
    }

    collection[method] = callback
  }
}
