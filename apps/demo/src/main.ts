/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { defaultRouter, defaultServer, LRequest, LResponse } from "@luftschloss/server"

const server = defaultServer()

server.get("", (request, response) => response.text("hello world"))

const router = defaultRouter()
router.get("/json", async (request: LRequest, response: LResponse) => {
  response.headers.append("why", "linting error")
  await response.json({ hello: "world" })
})
router.get("/path/{param}/{int:int}", (request, response) => response.json(request.pathParams()))
router.get("/html", (request, response) => response.html("<button>hello world</button>"))

const router2 = defaultRouter()
router2.get("2", (req: LRequest, res: LResponse) => res.json({ hello: "asdf" }))
router.mount(router2, { basePath: "test" })

server.mount(router, { basePath: "hello" })
server.listen()
