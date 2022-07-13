/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { jsonParser } from "@luftschloss/body"
import { normalizePath, saveObject, withDefaults } from "@luftschloss/core"
import {
  defaultErrorHandler,
  errorMiddleware,
  intPathValidator,
  loggerMiddleware,
  noContentSniff,
  numberPathValidator,
  pathPathValidator,
  poweredBy,
  requestCompleter,
  ServerBase,
  stringPathValidator,
  uuidPathValidator,
  withServerBase,
} from "@luftschloss/server"
import { OpenApiBuilder, PathItemObject } from "openapi3-ts"
import { ApiRouter } from "./api.router"

type ApiServerArgs = { generateOpenApi: boolean }

export class ApiServer extends withServerBase(ApiRouter) implements ServerBase {
  public openapi = new OpenApiBuilder()

  public constructor(private generateOpenApi: boolean) {
    super()
    this.on("routerMerged", ({ router, basePath }) => {
      if (router instanceof ApiRouter && this.generateOpenApi) {
        this.collectOpenApiDefinitions({ router, basePath })
      }
    })
  }

  private collectOpenApiDefinitions({ router, basePath }: { router: ApiRouter; basePath: string }) {
    for (const [apiPath, pathItemObject] of Object.entries(router.apiRoutes)) {
      const path = normalizePath(`${basePath}/${apiPath}`)
      this.openapi.addPath(path, pathItemObject as PathItemObject)
    }
  }
}

export const apiServer = (args: Partial<ApiServerArgs> = saveObject()) => {
  const { generateOpenApi } = withDefaults<ApiServerArgs>(args, { generateOpenApi: true })

  const server = new ApiServer(generateOpenApi)
  server
    .pipe(loggerMiddleware())
    .pipe(requestCompleter())
    .pipe(errorMiddleware({ ...defaultErrorHandler }))
    .pipe(noContentSniff())
    .pipe(jsonParser())
    .pipe(poweredBy())

  server
    .addPathValidator(intPathValidator())
    .addPathValidator(numberPathValidator())
    .addPathValidator(pathPathValidator())
    .addPathValidator(stringPathValidator())
    .addPathValidator(uuidPathValidator())

  return server
}
