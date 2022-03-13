import { ReadonlyMiddlewares } from "../middleware/middleware"
import { containsRegex, PathConverter, PathValidators, toRegex } from "../path-validator/validator"
import { HTTP_METHODS, ROUTE_HANDLER } from "./route-collector.model"
import { MountingOptions, Router } from "./router.model"
import { normalizePath } from "./utils"

export type FinishedRoute = {
  pipeline: ReadonlyMiddlewares
  executor: ROUTE_HANDLER
}

type Path = RegExp
export type MergedRoute = [[Path, PathConverter], Record<HTTP_METHODS, FinishedRoute | null>]
export type MergedRoutes = {
  lookup: Record<string, Record<HTTP_METHODS, FinishedRoute | null>>
  regex: Readonly<Readonly<MergedRoute>[]>
}

export class RouterMerger {
  private _collection = new Map<string, Record<HTTP_METHODS, FinishedRoute | null>>()
  private locked = false

  constructor(private validators: PathValidators) {}

  public entries(): MergedRoutes {
    if (!this.locked) throw new Error("Cannot retrieve routes because RouteMerger is not locked")

    const regexPaths: MergedRoute[] = []
    const lookupPaths: Record<string, Record<HTTP_METHODS, FinishedRoute | null>> = {}

    for (const [path, methods] of this._collection.entries()) {
      if (containsRegex(path)) {
        regexPaths.push([toRegex(path, this.validators), methods])
      } else {
        lookupPaths[path] = methods
      }
    }

    return {
      lookup: lookupPaths,
      regex: regexPaths,
    }
  }

  public mergeIn(router: Router, { basePath }: MountingOptions, parentPipeline: ReadonlyMiddlewares): void {
    if (this.locked) throw new Error("Route merger has been locked. You cannot add new routers.")
    for (let { handler, path, method } of router.routes.entries()) {
      path = normalizePath(`${basePath}/${path}`)
      if (!this._collection.has(path)) {
        this._collection.set(path, { DELETE: null, GET: null, PATCH: null, POST: null, PUT: null, OPTIONS: null })
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

  public lock(): void {
    this.locked = true
  }
}
