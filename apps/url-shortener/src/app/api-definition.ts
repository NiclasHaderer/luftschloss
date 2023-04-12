import { trimIndent } from "@luftschloss/common";
import { OpenApiRouterArgs } from "@luftschloss/openapi";

export const apiDefinition: OpenApiRouterArgs = {
  openApi: {
    tags: [
      {
        name: "shorten",
        description: "Shorten URLs",
      },
    ],
    servers: [
      {
        url: "http://0.0.0.0:3200",
        description: "Local server",
      },
    ],
    info: {
      title: "Swagger Shortened URLs - OpenAPI 3.0",
      version: "1.0.0",
      description: trimIndent`
        This is a sample server for a shortened URL service..
      `,
      termsOfService: "https://github.com/NiclasHaderer/luftschloss/blob/main/LICENSE",
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    externalDocs: {
      description: "Find out more about Luftschloss",
      url: "github.com/NiclasHaderer/luftschloss",
    },
    openapi: "3.0.3",
  },
};
