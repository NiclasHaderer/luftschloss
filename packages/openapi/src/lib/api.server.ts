/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { ExternalDocumentation, Info, OpenApiSchema, Server } from "@luftschloss/openapi-schema"
import { normalizePath } from "@luftschloss/common"
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
import { jsonParser } from "@luftschloss/body"

type ApiServerArgs = {
  openApi: {
    info: Info
    servers?: Server[]
    externalDocs?: ExternalDocumentation
  }
  generateOpenApi?: boolean
}

export class ApiServer extends withServerBase(ApiRouter) implements ServerBase {
  public constructor(private generateOpenApi: boolean, public readonly openApi: OpenApiSchema) {
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
      // const schema = generateJsonSchema()
    }
  }
}

export const apiServer = ({ openApi, generateOpenApi = true }: ApiServerArgs) => {
  const server = new ApiServer(generateOpenApi, { openapi: "3.1.0", ...openApi })
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
