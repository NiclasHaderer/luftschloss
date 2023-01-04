/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

/**
 * Every router has to expose a list of middlewares the callbacks in the routes' property will be wrapped in
 */
import { HTTP_METHODS, LookupResultStatus, ROUTE_HANDLER, ServerBase } from "../core";
import { Middleware, ReadonlyMiddlewares } from "../middleware";
import { PathValidator } from "../path-validator";

export interface MountingOptions {
  basePath: string;
}

export type ResolvedRoute = {
  availableMethods: HTTP_METHODS[];
  middlewares: ReadonlyMiddlewares;
  executor: ROUTE_HANDLER;
  status: LookupResultStatus;
  pathParams: Record<string, unknown>;
};

export interface Router {
  readonly children: Readonly<{ router: Router; options: MountingOptions }[]>;
  readonly routerMiddlewares: ReadonlyMiddlewares;
  readonly middlewares: ReadonlyMiddlewares;
  readonly locked: boolean;
  readonly parentRouter: Router | undefined;
  readonly server: ServerBase | undefined;
  readonly mountPath: string | undefined;
  readonly completePath: string | undefined;

  onMount(server: ServerBase, parentRouter: Router | undefined, mountPath: string, completePath: string): void;

  isMounted(): boolean;

  mount(router: Router[] | Router, options?: Partial<MountingOptions>): this;

  pipe(...middleware: Middleware[]): this;

  unPipe(...middleware: (Middleware | string)[]): this;

  unPipeAll(): this;

  addPathValidator(validator: PathValidator<unknown>): this;

  removePathValidator(validatorOrName: PathValidator<unknown> | string): this;

  resolveRoute(path: string, method: HTTP_METHODS): ResolvedRoute;

  /**
   * Check if the router can handle the path. This is done by comparing the base path of the router to the path of the
   * request
   * @param path The path of the request
   * @returns True if the router can handle the path, false otherwise
   */
  canHandle(path: string): boolean;

  lock(): void;
}
