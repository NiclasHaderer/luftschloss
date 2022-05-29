/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { jsonParser } from "@luftschloss/body"
import {
  defaultErrorHandler,
  errorMiddleware,
  intPathValidator,
  loggerMiddleware,
  noContentSniff,
  normalizePath,
  numberPathValidator,
  pathPathValidator,
  poweredBy,
  requestCompleter,
  saveObject,
  ServerBase,
  stringPathValidator,
  uuidPathValidator,
  withDefaults,
  withServerBase,
} from "@luftschloss/core"
import { OpenApiBuilder, PathItemObject } from "openapi3-ts"
import { ApiRouter } from "./api.router"

type ApiServerArgs = { generateOpenApi: boolean }

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