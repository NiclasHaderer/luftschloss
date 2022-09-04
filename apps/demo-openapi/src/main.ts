import { apiServer, openApiRouter, redocRouter, stoplightRouter, swaggerRouter } from "@luftschloss/openapi"
import { luft } from "@luftschloss/validation"

const main = async () => {
  const server = apiServer()
  server
    .build({
      query: luft.object({
        hello: luft.string(),
      }),
      response: luft
        .object({
          hello: luft.string(),
        })
        .named("HelloResponse"),
      path: luft.object({}),
    })
    .info({ summary: "Hello World" })
    .get("", ({ query }) => query)

  server
    .build({
      query: luft.object({
        hello: luft.array(luft.string().min(4).max(10)),
      }),
      response: luft
        .object({
          hello: luft.string(),
        })
        .named("Another Schema"),
      body: luft.object({
        hello: luft.string(),
        tes: luft.array(luft.number()),
      }),
      path: luft.object({}),
    })
    .post("", ({ query }) => ({ hello: query.hello[0] }))

  server.mount(stoplightRouter())
  server.mount(redocRouter())
  server.mount(swaggerRouter())
  server.mount(openApiRouter({ openApi: { info: { title: "test", version: "1.0.0" }, openapi: "3.0.3" } }))
  server.listen()
}
main()
