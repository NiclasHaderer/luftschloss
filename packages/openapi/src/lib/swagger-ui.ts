/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { ByLazy } from "@luftschloss/common"
import { LRequest, LResponse, Router, RouterBase, ServerBase } from "@luftschloss/server"
import { ApiServer } from "./api.server"

interface SwaggerRouterProps {
  docsUrl: string
  openApiUrl: string
}

export class SwaggerRouter extends RouterBase {
  public get server(): ApiServer | undefined {
    // We can cast here, because the onMount method throws an error if the server is not an openapi Server
    return this._server as ApiServer
  }

  @ByLazy<string, SwaggerRouter>(self => JSON.stringify(self.server!.openapi))
  private json!: string

  public constructor(private docsUrl: string, private openApiUrl: string) {
    super()
    this.routeCollector.add(this.docsUrl, "GET", this.handleDocs.bind(this))
    this.routeCollector.add(this.openApiUrl, "GET", this.handleJsonSchema.bind(this))
  }

  public override onMount(server: ServerBase, parentRouter: Router, completePath: string): void {
    if (!(server instanceof ApiServer)) {
      throw new Error("The swagger router can only be used with the ApiServer")
    }

    super.onMount(server, parentRouter, completePath)
  }

  private handleJsonSchema(_: LRequest, response: LResponse): Promise<void> {
    return response.json(this.json).end()
  }

  private async handleDocs(_: LRequest, response: LResponse) {
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

export const swaggerRouter = ({ docsUrl = "docs", openApiUrl = "openapi" }: Partial<SwaggerRouterProps> = {}) => {
  return new SwaggerRouter(docsUrl, openApiUrl)
}
