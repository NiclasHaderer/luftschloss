import { LRequest, LResponse } from "@luftschloss/server"
import { OpenApiUiRouter } from "./openapi-ui-router"

export class SwaggerRouter extends OpenApiUiRouter {
  protected async handleDocs(_: LRequest, response: LResponse) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="SwaggerUI"
        />
        <title>SwaggerUI</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
      </head>
      <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js" crossorigin></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '${this.openApiUrl}',
            dom_id: '#swagger-ui',
            deepLinking: true,
          });
        };
      </script>
      </body>
      </html>
    `
    await response.html(html).end()
  }
}

export type SwaggerRouterArgs = {
  docsUrl?: string
  openApiUrl?: string
}

export const swaggerRouter = ({ docsUrl = "/swagger", openApiUrl = "/openapi" }: SwaggerRouterArgs = {}) => {
  return new SwaggerRouter(docsUrl, openApiUrl)
}
