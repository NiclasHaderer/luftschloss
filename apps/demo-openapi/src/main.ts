import { trimIndent } from "@luftschloss/common"
import { apiRouter, apiServer, openApiRouter, redocRouter, stoplightRouter, swaggerRouter } from "@luftschloss/openapi"
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
        .named("HelloResponse")
        .description(`This is a very nice title`),
      path: luft.object({}),
    })
    .info({
      summary: "Hello World",
      description: trimIndent`
      # Update an existing pet by Id
        1. This is a list
        2. This is another list item
        3. This is the last list item
      `,
      tags: ["hello"],
    })
    .get(({ query }) => query)
    .info({ summary: "A new summary" })
    .get("test", ({ query }) => query)

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
    .post(({ query }) => ({ hello: query.hello[0] }))
    .modify({ response: luft.object({ world: luft.number() }) })
    .get("/hello", () => {
      return { world: 1 }
    })

  const router = apiRouter().tag("aaaa")
  router
    .build({})
    .info({ tags: ["hello"] })
    .get("asdf", () => undefined)
  server.mount(router)

  server.mount(stoplightRouter())
  server.mount(redocRouter())
  server.mount(swaggerRouter())
  server.mount(openApiRouter({ openApi: { info: { title: "test", version: "1.0.0" }, openapi: "3.0.3" } }))
  server.listen()
}

main()
