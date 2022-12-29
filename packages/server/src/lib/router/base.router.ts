/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import {
  ByLazy,
  escapeRegexString,
  findIndexes,
  normalizePath,
  saveObject,
  SKIP_CACHE,
  withDefaults,
} from "@luftschloss/common"
import {
  HTTP_METHODS,
  HTTPException,
  LookupResultStatus,
  resolveRoute,
  RouteCollector,
  ServerBase,
  Status,
} from "../core"
import { Middleware, ReadonlyMiddlewares } from "../middleware"
import {
  containsRegex,
  DEFAULT_PATH_VALIDATOR_NAME,
  defaultPathValidator,
  pathToRegex,
  PathValidator,
  PathValidators,
} from "../path-validator"
import { MountingOptions, ResolvedRoute, Router } from "./router"

export class RouterBase implements Router {
  protected readonly subRouters: { router: Router; options: MountingOptions }[] = []
  protected readonly routeCollector = new RouteCollector()
  protected _middlewares: Middleware[] = []
  protected _locked = false
  protected _parentRouter: Router | undefined = undefined
  protected _server?: ServerBase | undefined = undefined
  protected _mountPath: string | undefined = undefined
  protected _completePath: string | undefined = undefined
  protected pathValidators: PathValidators = {
    [DEFAULT_PATH_VALIDATOR_NAME]: defaultPathValidator(),
  }

  @ByLazy<RegExp | undefined, RouterBase>(self => {
    // Setup not complete, do not cache value
    if (!self.completePath) return [SKIP_CACHE, undefined]
    // Does not contain regex, so just return undefined
    if (!containsRegex(self.completePath)) return new RegExp(escapeRegexString(self.completePath))
    // Build the regex with an open end, because the router is not an actual handler. It just has to match the beginning
    // of the requested path.
    return pathToRegex(self.completePath, self.pathValidators, true)
  })
  public readonly completePathRegex: RegExp | undefined

  public get children(): { router: Router; options: MountingOptions }[] {
    return this.subRouters
  }

  public get locked(): boolean {
    return this._locked
  }

  public get routerMiddlewares(): ReadonlyMiddlewares {
    return this._middlewares
  }

  public get middlewares(): ReadonlyMiddlewares {
    return [...this.parentMiddlewares, ...this.routerMiddlewares]
  }

  public get parentMiddlewares(): ReadonlyMiddlewares {
    const parentMiddlewares: Readonly<Middleware>[] = []

    let parentRouter = this.parentRouter
    while (parentRouter) {
      parentMiddlewares.unshift(...parentRouter.routerMiddlewares)
      parentRouter = parentRouter.parentRouter
    }
    return parentMiddlewares
  }

  public get routes(): RouteCollector {
    return this.routeCollector
  }

  /**
   * This returns only the routers mounting path and can be incomplete if the router is mounted to another router which
   * itself has a base path. In this example the `path` would only be the routers one path.
   */
  public get mountPath(): string | undefined {
    return this._mountPath ? normalizePath(this._mountPath) : undefined
  }

  /**
   * The complete path to the router including the routers mouning path
   */
  public get completePath(): string | undefined {
    return this._completePath !== undefined ? normalizePath(this._completePath) : undefined
  }

  public get parentRouter(): Router | undefined {
    return this._parentRouter
  }

  public get server(): ServerBase | undefined {
    return this._server
  }

  public lock(): void {
    this._locked = true
    // Call different startup hooks
    this.propagateStartup()
    // Lock the route collector and provide it with the necessary information which it needs to build a lookup table
    this.routeCollector.lock(this._completePath!, this.pathValidators)
    // Call the sub-routers and lock them
    this.subRouters.map(r => r.router).forEach(r => r.lock())
  }

  @ByLazy<((path: string) => boolean) | undefined, RouterBase>(self => {
    // Setup not complete, do not cache value
    if (!self.completePath) return [SKIP_CACHE, undefined]
    // Does not contain regex, so just return undefined
    if (!containsRegex(self.completePath)) return path => path.startsWith(self.completePath!)
    // Build the regex with an open end, because the router is not an actual handler. It just has to match the beginning
    // of the requested path.
    const regex = pathToRegex(self.completePath, self.pathValidators, true)
    return path => regex.test(path)
  })
  public canHandle!: (path: string) => boolean

  private propagateStartup(): void {
    const routerParentMiddlewares = this.parentMiddlewares
    // Server is defined, because only the server can lock the router
    this._middlewares.forEach((m, index) => {
      let parentMiddlewares = routerParentMiddlewares
      if (index > 0) {
        // Tell each middleware the parent middlewares
        parentMiddlewares = [...routerParentMiddlewares, ...this.routerMiddlewares.slice(0, index - 1)]
      }

      m.onStartup?.(this.server!, this, parentMiddlewares)
    })
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

  public isMounted(): boolean {
    return !!this.server
  }

  public onMount(server: ServerBase, parentRouter: Router | undefined, mountPath: string, completePath: string): void {
    this._parentRouter = parentRouter
    this._server = server
    this._completePath = completePath
    this._mountPath = mountPath

    // This means that the router has been mounted by the server or has at least a connection to the server through
    // other mounted routers.
    // We can now call the onMount method of all the already mounted sub-routers.
    this.subRouters.forEach(({ router, options }) =>
      router.onMount(server, this, options.basePath, normalizePath(`${completePath}/${options.basePath}`))
    )
  }

  public mount(routers: Router | Router[], options: Partial<MountingOptions> = saveObject()): this {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot mount any new routers")
    }

    const completeOptions = withDefaults<MountingOptions>({ basePath: "/" }, options)

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
      if (this.isMounted()) {
        router.onMount(
          this.server!,
          this,
          completeOptions.basePath,
          normalizePath(`${this.completePath}/${completeOptions.basePath}`)
        )
      }
    }

    return this
  }

  public unPipe(...middlewaresToRemove: (Middleware | string)[]): this {
    if (this.locked) {
      throw new Error("Router has been locked. You cannot remove a middleware")
    }

    middlewaresToRemove = middlewaresToRemove.map(middleware =>
      typeof middleware === "object" ? middleware.name : middleware
    )
    const indexes = findIndexes(this._middlewares, m => middlewaresToRemove.includes(m.name))
    const sortedUniqueIndexes = [...new Set(indexes)].sort()

    sortedUniqueIndexes.forEach((middlewareIndex, index) => {
      this._middlewares.splice(middlewareIndex - index, 1)
    })

    return this
  }

  public unPipeAll(): this {
    this.unPipe(...this.middlewares.map(m => m.name))
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

  public removePathValidator(validatorName: string): this
  public removePathValidator(validator: PathValidator<unknown>): this
  public removePathValidator(validatorOrName: PathValidator<unknown> | string): this {
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

    this.children.forEach(({ router }) => router.removePathValidator(validatorOrName))
    return this
  }

  /**
   * Resolve a certain path and return a route handler including all the middlewares up until this point.
   * Parent router are responsible to add their own middlewares to the lookup result
   * @param path The *complete* path of the request. This includes the parent path of the request
   * @param method The method of the request
   */
  public resolveRoute(path: string, method: HTTP_METHODS): ResolvedRoute {
    // Used to save the earliest appearance of a route not found lookup result in case the only result will be this one
    let wrongMethod: Omit<ResolvedRoute, "executor"> | undefined

    // Lookup routes in the router
    const route = resolveRoute(path, method, this.routeCollector.completeRoutes())

    // In case the route was found here, return
    if (route.status === LookupResultStatus.OK) {
      return { ...route, middlewares: this.middlewares }
    } else if (route.status === LookupResultStatus.METHOD_NOT_ALLOWED) {
      // Save the wrong method here
      wrongMethod = { ...route, middlewares: this.middlewares }
    } else {
      // Iterate over the sub routes and call the resolveRoute method in them
      for (const { router } of this.subRouters) {
        // If the request path does not start with the complete path of the router we can skip it.
        const skipRouter = !router.canHandle(path)
        if (skipRouter) continue

        const childRoute = router.resolveRoute(path, method)
        if (childRoute.status === LookupResultStatus.OK) {
          return childRoute
        } else if (!wrongMethod && childRoute.status === LookupResultStatus.METHOD_NOT_ALLOWED) {
          // Save the route not found result if there has not been a route not found result earlier
          wrongMethod = childRoute
        }
      }
    }

    // Return wrong method result if there has been one
    if (wrongMethod) {
      return {
        ...wrongMethod,
        executor: (_, response) => {
          response.header("Allow", wrongMethod!.availableMethods)
          throw new HTTPException(Status.HTTP_405_METHOD_NOT_ALLOWED)
        },
      }
    }

    // Nothing matched so return the notFound method of this router
    return {
      ...route,
      middlewares: this.middlewares,
      executor: () => {
        throw new HTTPException(Status.HTTP_404_NOT_FOUND)
      },
      pathParams: {},
    }
  }
}
