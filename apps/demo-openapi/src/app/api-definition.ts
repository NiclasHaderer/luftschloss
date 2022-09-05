import { trimIndent } from "@luftschloss/common"
import { OpenApiRouterArgs } from "@luftschloss/openapi"

export const apiDefinition: OpenApiRouterArgs = {
  openApi: {
    tags: [
      {
        name: "pet",
        description: "Everything about your Pets",
      },
    ],
    servers: [
      {
        url: "http://127.0.0.1:3200",
        description: "Local server",
      },
      { url: "https://petstore3.swagger.io/api/v3", description: "Official petstore server" },
    ],
    info: {
      title: "Swagger Petstore - OpenAPI 3.0",
      version: "1.0.0",
      description: trimIndent`
          This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about
          Swagger at [https://swagger.io](https://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!
          You can now help us improve the API whether it's by making changes to the definition itself or to the code.
          That way, with time, we can improve the API in general, and expose some of the new features in OAS3.

          _If you're looking for the Swagger 2.0/OAS 2.0 version of Petstore, then click [here](https://editor.swagger.io/?url=https://petstore.swagger.io/v2/swagger.yaml). Alternatively, you can load via the \`Edit > Load Petstore OAS 2.0\` menu option!_

          Some useful links:
          - [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)
          - [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)
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
}
