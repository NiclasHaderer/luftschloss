/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { jsonParser } from "@luftschloss/body"
import { normalizePath } from "@luftschloss/common"
import { ExternalDocumentation, generateJsonSchema, Info, OpenApiSchema, Server } from "@luftschloss/openapi-schema"
import {
  DefaultErrorHandler,
  errorMiddleware,
  HTTP_METHODS,
  intPathValidator,
  loggerMiddleware,
  noContentSniff,
  numberPathValidator,
  pathPathValidator,
  poweredBy,
  Router,
  ServerBase,
  stringPathValidator,
  uuidPathValidator,
  withServerBase,
} from "@luftschloss/server"
import { ApiRouter } from "./api.router"

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
    this.generateOpenApi &&
      this.onComplete("start").then(() => {
        if (this.generateOpenApi) {
          this.generateOpenApiSchema()
        }
      })
  }

  private generateOpenApiSchema() {
    const routes = this.collectRoutes(this)
    if (this.openApi.components === undefined) {
      this.openApi.paths = {}
    }
    // Add the routes to the openapi schema of the router
    for (const route of routes) {
      const bodySchema = route.validator.body ? generateJsonSchema(route.validator.body) : undefined
      const responseSchema = route.validator.response ? generateJsonSchema(route.validator.response) : undefined

      if (!this.openApi.paths![normalizePath(route.url) as `/${string}`]) {
        this.openApi.paths![normalizePath(route.url) as `/${string}`] = {}
      }

      const apiRoute = this.openApi.paths![normalizePath(route.url) as `/${string}`]
      for (const methodElement of route.method) {
        apiRoute[methodElement.toLowerCase() as Lowercase<HTTP_METHODS>] = {
          parameters: [
            ...Object.entries(route.validator.path?.schema?.type || {}).map(([name, value]) => ({
              name,
              schema: generateJsonSchema(value),
              in: "path" as const,
              required: true,
            })),
            ...Object.entries(route.validator.headers?.schema?.type || {}).map(([name, value]) => ({
              name,
              schema: generateJsonSchema(value),
              in: "header" as const,
              required: true,
            })),
            ...Object.entries(route.validator.query?.schema?.type || {}).map(([name, value]) => ({
              name,
              schema: generateJsonSchema(value),
              in: "query" as const,
              required: true,
            })),
          ],
          responses: {
            default: {
              description: "TODO", // TODO
              content: {
                "application/json": {
                  schema: responseSchema,
                },
              },
            },
          },
        }
        if (bodySchema) {
          apiRoute[methodElement.toLowerCase() as Lowercase<HTTP_METHODS>]!.requestBody = {
            content: {
              "application/json": {
                schema: bodySchema,
              },
            },
          }
        }
      }
    }
  }

  private collectRoutes(router: Router): ApiRouter["apiRoutes"] {
    const apiRoutes: ApiRouter["apiRoutes"] = []
    const children: Router[] = [router]

    for (const child of children) {
      if (child instanceof ApiRouter) {
        apiRoutes.push(...child.apiRoutes)
      }
      children.push(...child.children.map(c => c.router))
    }
    return apiRoutes
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
