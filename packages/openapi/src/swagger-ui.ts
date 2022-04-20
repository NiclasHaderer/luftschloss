/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { ByLazy, DefaultRouter, LRequest, LResponse, ServerBase } from "@luftschloss/core"
import { ApiServer } from "./api.server"

interface SwaggerRouterProps {
  docsUrl: string
  openApiUrl: string
}

export class SwaggerRouter extends DefaultRouter {
  private server!: ApiServer

  @ByLazy<string, SwaggerRouter>(self => self.server.openapi.getSpecAsJson())
  private json!: string

  @ByLazy<string, SwaggerRouter>(self => self.server.openapi.getSpecAsYaml())
  private yaml!: string

  constructor(private docsUrl: string, private openApiUrl: string) {
    super()
    this.get(this.docsUrl, this.handleDocs.bind(this))
    this.get(this.openApiUrl, this.handleJsonSchema.bind(this))
  }

  public override onMount(server: ServerBase): void {
    if (!(server instanceof ApiServer)) {
      throw new Error("The swagger router can only be used with the ApiServer")
    }

    this.server = server
  }

  private handleJsonSchema(_: LRequest, response: LResponse): void {
    response.json(this.json)
  }

  private handleYmlSchema(_: LRequest, response: LResponse): void {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-call
    response.headers.set("Content-Type", "text/yaml")
    response.text(this.yaml)
  }

  private handleDocs(_: LRequest, response: LResponse) {
    const html = `
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Luftschloss OpenApi</title>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
      <script>
        const ui = SwaggerUIBundle({
          url: '%openApiUrl%',
          oauth2RedirectUrl: window.location.origin + '/docs/oauth2-redirect',
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset
          ],
          layout: "BaseLayout",
          deepLinking: true,
          showExtensions: true,
          showCommonExtensions: true
        })
      </script>
    </body>
    </html>
    `.replace("%openApiUrl%", `${this.openApiUrl}.json`)
    response.html(html)
  }
}

export const swaggerRouter = ({ docsUrl = "docs", openApiUrl = "openapi" }: Partial<SwaggerRouterProps>) => {
  return new SwaggerRouter(docsUrl, openApiUrl)
}
