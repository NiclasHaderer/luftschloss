import { trimIndent } from "@luftschloss/common";
import { OpenApiRouterArgs } from "@luftschloss/openapi";

export const apiDefinition: OpenApiRouterArgs = {
  openApi: {
    openapi: "3.0.3",
    tags: [
      {
        name: "users",
        description: "User management",
      },
    ],
    servers: [
      {
        url: "http://127.0.0.1:3300",
        description: "Local server",
      },
    ],
    info: {
      title: "User management - OpenAPI 3.x",
      version: "1.0.0",
      description: trimIndent`
        This is a simple API for managing users.
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
    components: {},
  },
};
