import { LRequest, LResponse } from "@luftschloss/server";
import { OpenApiUiRouter } from "./openapi-ui-router";

export class StoplightRouter extends OpenApiUiRouter {
  protected handleDocs(_: LRequest, response: LResponse) {
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
    `;
    response.html(html);
  }
}

export type StoplightRouterArgs = {
  docsUrl?: string;
  openApiUrl?: string;
};

export const stoplightRouter = ({ docsUrl = "/stoplight", openApiUrl = "/openapi" }: StoplightRouterArgs = {}) => {
  return new StoplightRouter(docsUrl, openApiUrl);
};
