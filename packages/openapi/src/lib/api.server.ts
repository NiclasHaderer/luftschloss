/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { jsonParser } from "@luftschloss/body"
import { OpenApiSchema } from "@luftschloss/openapi-schema"
import { normalizePath, saveObject, withDefaults } from "@luftschloss/common"
import {
  DefaultErrorHandler,
  errorMiddleware,
  intPathValidator,
  loggerMiddleware,
  noContentSniff,
  numberPathValidator,
  pathPathValidator,
  poweredBy,
  ServerBase,
  stringPathValidator,
  uuidPathValidator,
  withServerBase,
} from "@luftschloss/server"
import { ApiRouter } from "./api.router"

type ApiServerArgs = { generateOpenApi: boolean }

export class ApiServer extends withServerBase(ApiRouter) implements ServerBase {
  // TODO
  public openapi: OpenApiSchema = {
    info: {
      title: "My fancy title",
      version: "0.0.0",
    },
    openapi: "3.1.0",
  }

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
      // TODO
    }
  }
}

export const apiServer = (args: Partial<ApiServerArgs> = saveObject()) => {
  const { generateOpenApi } = withDefaults<ApiServerArgs>(args, { generateOpenApi: true })

  const server = new ApiServer(generateOpenApi)
  server
    .pipe(loggerMiddleware())
    .pipe(errorMiddleware({ ...DefaultErrorHandler }))
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
