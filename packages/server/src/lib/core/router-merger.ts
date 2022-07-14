/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { GenericEventEmitter, normalizePath, saveObject } from "@luftschloss/core"
import { ReadonlyMiddlewares } from "../middleware"
import { containsRegex, PathConverter, PathValidators, toRegex } from "../path-validator"
import { MountingOptions, Router } from "../router"
import { HTTP_METHODS, ROUTE_HANDLER } from "./route-collector.model"
import { LuftServerEvents, ServerBase } from "./server-base"

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

  public constructor(private validators: PathValidators, private events: GenericEventEmitter<LuftServerEvents>) {}

  public entries(): MergedRoutes {
    if (!this.locked) throw new Error("Cannot retrieve routes because RouteMerger is not locked")

    const regexPaths: MergedRoute[] = []
    const lookupPaths: Record<string, Record<HTTP_METHODS, FinishedRoute | null>> = saveObject()

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

  public mergeIn(
    server: ServerBase,
    router: Router,
    { basePath }: MountingOptions,
    parentPipeline: ReadonlyMiddlewares
  ): void {
    if (this.locked) throw new Error("Route merger has been locked. You cannot add new routers.")
    this.events.emit("routerMerged", { router, basePath: normalizePath(basePath) })

    for (let { handler, path, method } of router.routes.entries()) {
      path = normalizePath(`${basePath}/${path}`)
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
        throw new Error(`Route ${path} already has a handler registered. Registering handlers twice is not possible`)
      }

      collection[method] = {
        executor: handler,
        pipeline: [...parentPipeline, ...router.middlewares],
      }
    }

    // Call router onMount hook
    router?.onMount?.(server)

    for (const { router: childRouter, options } of router.children) {
      this.mergeIn(
        server,
        childRouter,
        {
          basePath: `${basePath}/${options.basePath}`,
        },
        [...parentPipeline, ...router.middlewares]
      )
    }
  }

  public lock(): void {
    this.locked = true
  }
}
