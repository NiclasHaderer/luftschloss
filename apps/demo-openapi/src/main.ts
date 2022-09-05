import { apiServer, openApiRouter, redocRouter, stoplightRouter, swaggerRouter } from "@luftschloss/openapi"
import { apiDefinition } from "./app/api-definition"
import { petRouter } from "./app/routes/pet"

const main = async () => {
  const server = apiServer()
  server.mount(petRouter, { basePath: "/pet" })
  server.mount(openApiRouter(apiDefinition))
  server.mount(stoplightRouter())
  server.mount(redocRouter())
  server.mount(swaggerRouter())
  server.listen()
}

main()
