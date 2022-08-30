import { apiServer, swaggerRouter } from "@luftschloss/openapi"
import { luft } from "@luftschloss/validation"

const main = async () => {
  const server = apiServer({ openApi: { info: { title: "Hello world", version: "0.0.0" } } })
  server
    .get("", {
      query: luft.object({
        hello: luft.string(),
      }),
      response: luft.object({
        hello: luft.string(),
      }),
      path: luft.object({}),
    })
    .handle(({ query, path, body, headers }) => {
      return query
    })
  server.mount(swaggerRouter())
  server.listen()
}
main()
