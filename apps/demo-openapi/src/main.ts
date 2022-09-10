import { apiServer, openApiRouter, redocRouter, stoplightRouter, swaggerRouter } from "@luftschloss/openapi"
import { apiDefinition } from "./app/api-definition"
import { petRouter } from "./app/routes/pet"
import { corsMiddleware, Status } from "@luftschloss/server"
import { luft } from "@luftschloss/validation"

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

let t = luft.string().status(Status.HTTP_500_INTERNAL_SERVER_ERROR).generateJsonSchema("")
console.log(t)
t = luft.string().generateJsonSchema("").status(500)
console.log(t)
