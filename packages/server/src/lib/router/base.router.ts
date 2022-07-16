/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { normalizePath, saveObject, withDefaults } from "@luftschloss/core"
import { ReadonlyRouteCollector, RouteCollectorImpl, ServerBase } from "../core"
import { Middleware, ReadonlyMiddlewares } from "../middleware"
import { MountingOptions, Router } from "./router"
import { DEFAULT_PATH_VALIDATOR_NAME, defaultPathValidator, PathValidator, PathValidators } from "../path-validator"

export class RouterBase implements Router {
  protected readonly subRouters: { router: Router; options: MountingOptions }[] = []
  protected readonly _routeCollector = new RouteCollectorImpl()
  protected _middlewares: Middleware[] = []
  protected _locked = false
  protected _parentRouter?: Router
  protected _server?: ServerBase
  protected _mountPath?: string
  protected _completePath?: string
  protected pathValidators: PathValidators = {
    [DEFAULT_PATH_VALIDATOR_NAME]: defaultPathValidator(),
  }

  public get children(): { router: Router; options: MountingOptions }[] {
    return this.subRouters
  }

  public get locked(): boolean {
    return this._locked
  }

  public get middlewares(): ReadonlyMiddlewares {
    return this._middlewares
  }

  public get routes(): ReadonlyRouteCollector {
    return this._routeCollector
  }

  public get path(): string | undefined {
    return this._mountPath ? normalizePath(this._mountPath) : undefined
  }

  public get completePath(): string | undefined {
    return this._completePath ? normalizePath(this._completePath) : undefined
  }

  public get parentRouter(): Router | undefined {
    return this._parentRouter
  }

  public get server(): ServerBase | undefined {
    return this._server
  }

  public get completeMiddlewares(): ReadonlyMiddlewares {
    return [...this.parentMiddlewares, ...this.middlewares]
  }

  public get parentMiddlewares(): ReadonlyMiddlewares {
    let parentRouter = this.parentRouter
    let parentMiddlewares: ReadonlyMiddlewares = []
    while (parentRouter) {
      parentMiddlewares = parentMiddlewares.concat(parentRouter.middlewares)
      parentRouter = parentRouter.parentRouter
    }
    return parentMiddlewares
  }

  public lock(): void {
    this._locked = true

    const routerParentMiddlewares = this.parentMiddlewares
    // Server is defined, because only the server can lock the router
    this._middlewares.forEach((m, index) => {
      let parentMiddlewares = routerParentMiddlewares
      if (index > 0) {
        parentMiddlewares = [...routerParentMiddlewares, ...this.middlewares.slice(0, index - 1)]
      }

      m.onStartup?.(this.server!, this, parentMiddlewares)
    })
    this.subRouters.map(r => r.router).forEach(r => r.lock())
  }

  public pipe(...middlewares: Middleware[]): this {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot add a new middleware")
    }
    for (const middleware of middlewares) {
      this._middlewares.push(middleware)
    }
    return this
  }

  public onMount(server: ServerBase, parentRouter: Router, completePath: string): void {
    this._parentRouter = parentRouter
    this._server = server
    this._completePath = completePath

    // This means that the router has been mounted by the server or has at least a connection to the server through
    // other mounted routers.
    // We can now call the onMount method of all the already mounted sub-routers.
    this.subRouters.forEach(({ router, options }) =>
      router.onMount(server, this, normalizePath(`${completePath}/${options.basePath}`))
    )
  }

  // TODO create something like pipeOnly to be able to add a middleware which will only able to be used by one handler.

  public mount(routers: Router | Router[], options: Partial<MountingOptions> = saveObject()): this {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot mount any new routers")
    }

    const completeOptions = withDefaults<MountingOptions>(options, { basePath: "/" })
    this._mountPath = completeOptions.basePath

    if (!Array.isArray(routers)) {
      routers = [routers]
    }

    for (const router of routers) {
      // Add the routers as child router
      this.subRouters.push({ router, options: completeOptions })
      // Add "this" routers' path validators to the children
      Object.values(this.pathValidators).forEach(validator => router.addPathValidator(validator))

      // Call the on mount method only if this router has been mounted to the server and the server property is therefore
      // not null. If this is not the case here the uncalled onMount functions will be called in "this" routers onMount method
      if (this.server && this.completePath) {
        router.onMount(this.server!, this, normalizePath(`${this.completePath}/${completeOptions.basePath}`))
      }
    }

    return this
  }

  public unPipe(...middlewaresToRemove: Middleware[]): this {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot remove a middleware")
    }

    // Reverse the middleware list to remove the last middleware with the name that was added
    const reversedMiddlewares = this._middlewares.reverse()
    for (const middleware of middlewaresToRemove) {
      const middlewareIndex = reversedMiddlewares.findIndex(m => m.name === middleware.name)

      if (middlewareIndex === -1) {
        console.warn("Middleware was not found and therefore could not be removed.")
      } else {
        this._middlewares.splice(middlewareIndex - 1, 1)
      }
    }

    return this
  }

  public addPathValidator(validator: PathValidator<unknown>): this {
    if (this.locked) {
      throw new Error("Cannot add new validator after server has been started")
    }
    this.pathValidators[validator.name] = validator
    this.children.forEach(({ router }) => router.addPathValidator(validator))
    return this
  }

  public removePathValidator(validatorOrName: PathValidator<unknown> | string, skipChildren = false): this {
    if (this.locked) {
      throw new Error("Cannot remove validator after server has been started")
    }

    if (typeof validatorOrName === "string") {
      if (validatorOrName === DEFAULT_PATH_VALIDATOR_NAME) {
        throw new Error("Cannot remove default validator")
      }
      delete this.pathValidators[validatorOrName]
    } else {
      if (validatorOrName.name === DEFAULT_PATH_VALIDATOR_NAME) {
        throw new Error("Cannot remove default validator")
      }
      delete this.pathValidators[validatorOrName.name]
    }

    !skipChildren && this.children.forEach(({ router }) => router.removePathValidator(validatorOrName))
    return this
  }

  public resolvePath() {
    // TODO
  }
}
