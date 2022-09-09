import { apiServer, openApiRouter, redocRouter, stoplightRouter, swaggerRouter } from "@luftschloss/openapi"
import { apiDefinition } from "./app/api-definition"
import { petRouter } from "./app/routes/pet"
import { corsMiddleware } from "@luftschloss/server"

const main = async () => {
  const server = apiServer()
  server.pipe(
    corsMiddleware({
      allowCredentials: true,
      allowedHeaders: "*",
      allowedMethods: "*",
      allowOriginFunction: () => true,
    })
  )
  server.mount(petRouter, { basePath: "/pet" })
  server.mount(openApiRouter(apiDefinition))
  server.mount(stoplightRouter())
  server.mount(redocRouter())
  server.mount(swaggerRouter())
  server.listen()
}
main()
