/*
/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { normalizePath } from "@luftschloss/common";
import { OpenApiSchema } from "@luftschloss/openapi-schema";
import { getRootRouter, LRequest, LResponse, Router, RouterBase, ServerBase } from "@luftschloss/server";
import { addRouteToOpenApi } from "./add-route-to-openapi";
import { CollectedRoute } from "./api.route";
import { ApiRouter } from "./api.router";

export class OpenApiRouter extends RouterBase {
  public constructor(public readonly openApi: OpenApiSchema, protected openApiUrl: string) {
    super();
    this.routeCollector.add(this.openApiUrl, "GET", this.handleOpenApi.bind(this));
  }

  public override onMount(server: ServerBase, parentRouter: Router, mountPath: string, completePath: string): void {
    super.onMount(server, parentRouter, mountPath, completePath);
    void server.onComplete("startup").then(() => this.generateOpenApiSchema());
  }

  protected handleOpenApi(_: LRequest, response: LResponse): void {
    response.json(this.openApi);
  }

  private async generateOpenApiSchema() {
    const routes = this.collectRoutes(getRootRouter(this));
    // Add the routes to the openapi schema of the router
    for (const route of routes) {
      await addRouteToOpenApi(this.openApi, route);
    }
  }

  private collectRoutes(router: Router): CollectedRoute[] {
    const apiRoutes: ApiRouter["apiRoutes"] = [];
    const children: Router[] = [router];

    for (const child of children) {
      children.push(...child.children.map(c => c.router));

      if (child instanceof ApiRouter) {
        apiRoutes.push(
          ...child.apiRoutes.map(route => {
            let completePath = normalizePath(`${child.completePath!}/${route.path}`);
            const matchPath = completePath.match(/(?<complete>\{(?<path>\w+):\w+})/);
            if (matchPath?.groups?.path) {
              completePath = completePath.replace(
                matchPath.groups.complete,
                `{${matchPath.groups.path}}`
              ) as `/${string}`;
            }

            return {
              ...route,
              path: completePath,
            };
          })
        );
      }
    }
    return apiRoutes;
  }
}

export type OpenApiRouterArgs = {
  openApi: Pick<OpenApiSchema, "info"> & Partial<Omit<OpenApiSchema, "info">>;

  openApiUrl?: string;
};

export const openApiRouter = ({ openApi, openApiUrl = "/openapi" }: OpenApiRouterArgs) => {
  return new OpenApiRouter({ openapi: "3.1.0", ...openApi }, openApiUrl);
};
