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
        This is a sample server for a shortened URL service. You can find out more about Swagger at
        [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).
      `,
      termsOfService: "http://swagger.io/terms/",
      license: {
        name: "Apache 2.0",
        url: "http://www.apache.org/licenses/LICENSE-2.0.html",
      },
    },
    externalDocs: {
      description: "Find out more about Swagger",
      url: "http://swagger.io",
    },
    openapi: "3.0.3",
  },
};
