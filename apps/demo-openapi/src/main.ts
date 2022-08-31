import { apiServer, openapiElementsRouter } from "@luftschloss/openapi"
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
      path: luft.object({}),
    })
    .handle(({ query }) => query)

  server
    .post("", {
      query: luft.object({
        hello: luft.string(),
      }),
      response: luft.object({
        hello: luft.string(),
      }),
      body: luft.object({
        hello: luft.string(),
        tes: luft.array(luft.number()),
      }),
      path: luft.object({}),
    })
    .handle(({ query }) => query)

  server.mount(openapiElementsRouter({ openApi: { info: { title: "Hello world", version: "0.0.0" } } }))
  server.listen()
}
main()
