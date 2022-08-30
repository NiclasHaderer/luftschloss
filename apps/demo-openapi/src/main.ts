import { apiServer, swaggerRouter } from "@luftschloss/openapi"
import { luft } from "@luftschloss/validation"

const main = async () => {
  const server = apiServer()
  server
    .get("", {
      query: luft.object({
        hello: luft.string(),
      }),
      response: luft.object({
        hello: luft.string(),
      }),
    })
    .handle(url => {
      return url
    })
  server.mount(swaggerRouter())
  server.listen()
}
main()
