import { LRequest, LResponse } from "@luftschloss/server"
import { OpenApiUiRouter } from "./openapi-ui-router"

export class RedocRouter extends OpenApiUiRouter {
  protected async handleDocs(_: LRequest, response: LResponse) {
    const html = `
     <!doctype html>
     <html lang="en">
       <head>
         <meta charset="utf-8">
         <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
         <title>Elements in HTML</title>
         <style>
          body {
            margin: 0;
            padding: 0;
          }
         </style>
         </head>
       <body>
          <redoc spec-url="${this.openApiUrl}"></redoc>
          <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"> </script>
       </body>
     </html>
    `
    await response.html(html)
  }
}

export type RedorRouterArgs = {
  docsUrl?: string
  openApiUrl?: string
}

export const redocRouter = ({ docsUrl = "/redoc", openApiUrl = "/openapi" }: RedorRouterArgs = {}) => {
  return new RedocRouter(docsUrl, openApiUrl)
}
