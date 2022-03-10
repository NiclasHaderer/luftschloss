import { HTTP_METHODS, ROUTE_HANDLER } from "./route-collector.model"
import { MountingOptions, Router } from "./router.model"
import { ReadonlyMiddlewares } from "../middleware/middleware"
import { normalizePath } from "./utils"

type FinishedRoute = {
  pipeline: ReadonlyMiddlewares
  executor: ROUTE_HANDLER
}

// TODO path has to become type regex
type Path = string
export type MergedRoute = [Path, Record<HTTP_METHODS, FinishedRoute | null>]

export class RouterMerger {
  private _collection = new Map<string, Record<HTTP_METHODS, FinishedRoute | null>>()
  private locked = false

  public entries(): Iterator<MergedRoute> {
    if (!this.locked) throw new Error("Cannot retrieve routes because RouteMerger is not locked")
    return this._collection.entries()
  }

  public mergeIn(router: Router, { basePath }: MountingOptions, parentPipeline: ReadonlyMiddlewares): void {
    // TODO merge into a regex which includes the validators
    // TODO save which capture group represents which param name
    if (this.locked) throw new Error("Route merger has been locked. You cannot add new routers.")
    for (let { handler, path, method } of router.routes.entries()) {
      path = normalizePath(`${basePath}/${path}`)
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

  public lock(): void {
    this.locked = true
  }
}
