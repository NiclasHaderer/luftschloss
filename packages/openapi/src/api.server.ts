/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { normalizePath, ServerBase, withServerBase } from "@luftschloss/core"
import { PathItemObject } from "openapi3-ts"
import { OpenApiBuilder } from "openapi3-ts/src/dsl/OpenApiBuilder"
import { ApiRouter } from "./api.router"

export class ApiServer extends withServerBase(ApiRouter) implements ServerBase {
  public openapi = new OpenApiBuilder()

  constructor(private generateOpenApi: boolean) {
    super()
    this.routerMerged$.subscribe(({ router, basePath }) => {
      if (router instanceof ApiRouter && this.generateOpenApi) {
        this.collectOpenApiDefinitions({ router, basePath })
      }
    })
  }

  public collectOpenApiDefinitions({ router, basePath }: { router: ApiRouter; basePath: string }) {
    for (const [apiPath, pathItemObject] of Object.entries(router.apiRoutes)) {
      const path = normalizePath(`${basePath}/${apiPath}`)
      this.openapi.addPath(path, pathItemObject as PathItemObject)
    }
  }
}

export const apiServer = () => {
  // TODO
}
