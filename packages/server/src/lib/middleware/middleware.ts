/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { LRequest, LResponse, ServerBase } from "../core"
import { Router } from "../router"

export type NextFunction = (request: LRequest, response: LResponse) => Promise<void>

export type Middleware = {
  readonly name: string
  readonly version: string
  readonly handle: (next: NextFunction, req: LRequest, res: LResponse) => Promise<void>
  readonly onMount?: (server: ServerBase, router: Router, parentMiddlewares: ReadonlyMiddlewares) => Promise<void>
}

export type ReadonlyMiddlewares = ReadonlyArray<Readonly<Middleware>>
