import { OpenApiDocsRouter } from "./openapi-docs-router"
import { ExternalDocumentation, Info, Server } from "@luftschloss/openapi-schema"
import { LRequest, LResponse } from "@luftschloss/server"

export class OpenApiElementsRouter extends OpenApiDocsRouter {
  protected async handleDocs(_: LRequest, response: LResponse) {
    const html = `
     <!doctype html>
     <html lang="en">
       <head>
         <meta charset="utf-8">
         <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
         <title>Elements in HTML</title>
         <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
         <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
       </head>
       <body>

         <elements-api
           apiDescriptionUrl="${this.openApiUrl}"
           router="hash"
           layout="sidebar"
         />

       </body>
     </html>
    `
    await response.html(html).end()
  }
}

type ApiServerArgs = {
  openApi: {
    info: Info
    servers?: Server[]
    externalDocs?: ExternalDocumentation
  }
  docsUrl?: string
  openApiUrl?: string
}

export const openapiElementsRouter = ({ docsUrl = "docs", openApiUrl = "openapi", openApi }: ApiServerArgs) => {
  return new OpenApiElementsRouter(
    {
      openapi: "3.1.0",
      ...openApi,
    },
    docsUrl,
    openApiUrl
  )
}
