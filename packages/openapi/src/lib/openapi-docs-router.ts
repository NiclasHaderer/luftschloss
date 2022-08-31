/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { normalizePath } from "@luftschloss/common"
import { OpenApiSchema } from "@luftschloss/openapi-schema"
import { LRequest, LResponse, Router, RouterBase, ServerBase } from "@luftschloss/server"
import { CollectedRoute } from "./api.route"
import { ApiRouter } from "./api.router"
import { addRouteToOpenApi } from "./helpers"

export abstract class OpenApiDocsRouter extends RouterBase {
  protected abstract handleDocs(_: LRequest, response: LResponse): Promise<void>

  public constructor(public readonly openApi: OpenApiSchema, protected docsUrl: string, protected openApiUrl: string) {
    super()
    this.routeCollector.add(this.docsUrl, "GET", this.handleDocs.bind(this))
    this.routeCollector.add(this.openApiUrl, "GET", this.handleOpenApi.bind(this))
  }

  public override onMount(server: ServerBase, parentRouter: Router, completePath: string): void {
    void server.onComplete("start").then(() => this.generateOpenApiSchema())
    super.onMount(server, parentRouter, completePath)
  }

  protected handleOpenApi(_: LRequest, response: LResponse): Promise<void> {
    return response.json(this.openApi).end()
  }

  private generateOpenApiSchema() {
    const routes = this.collectRoutes(this)

    // Add the routes to the openapi schema of the router
    for (const route of routes) {
      addRouteToOpenApi(this.openApi, route)
    }
  }

  private collectRoutes(router: Router): CollectedRoute[] {
    const apiRoutes: ApiRouter["apiRoutes"] = []
    const children: Router[] = [router]

    for (const child of children) {
      if (child instanceof ApiRouter) {
        apiRoutes.push(
          ...child.apiRoutes.map(route => ({
            ...route,
            url: normalizePath(`${child.completePath!}/${route.url}`),
          }))
        )
      }
      children.push(...child.children.map(c => c.router))
    }
    return apiRoutes
  }
}
