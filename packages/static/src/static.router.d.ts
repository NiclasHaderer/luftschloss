import { Router } from "@luftschloss/core/dist/router/router"
import { BaseRouter } from "@luftschloss/core/dist/router/base.router"
import { Request } from "@luftschloss/core/dist/core/request"
import { Response } from "@luftschloss/core/dist/core/response"
declare type StaticRouterProps = {
  followSymLinks: boolean
}
declare class StaticRouter extends BaseRouter implements Router {
  private folderPath
  private options
  constructor(folderPath: string, options: StaticRouterProps)
  protected handlePath(
    request: Request<
      object,
      {
        path: string
      }
    >,
    response: Response
  ): Promise<void>
  protected respondWithFile(request: Request, response: Response, absPath: string): void
  protected respondWithFileNotFound(request: Request, response: Response, relPath: string): void
  private toAbsPath
}
export declare const staticRouter: (folderPath: string, options?: Partial<StaticRouterProps>) => StaticRouter
export {}
//# sourceMappingURL=static.router.d.ts.map
