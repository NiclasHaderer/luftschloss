/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { jsonParser } from "@luftschloss/body"
import { defaultRouter, defaultServer, LRequest, LResponse } from "@luftschloss/server"
import { staticContent } from "@luftschloss/static"

const server = defaultServer().pipe(jsonParser(), staticContent({ allowOutsideBasePath: true }))

server.get("", (request, response) => response.text("hello world"))

const router = defaultRouter()
router.get("/json", (request: LRequest, response: LResponse) => {
  response.headers.append("why", "linting error")
  response.json({ hello: "world" })
})
router.get("/path/{param}/{int:int}", (request, response) => response.json(request.pathParams()))
router.get("/html", (request, response) => response.html("<button>hello world</button>"))

const router2 = defaultRouter()
router2.get("2", (req: LRequest, res: LResponse) => res.json({ hello: "asdf" }))
router.mount(router2, { basePath: "test" })

server.mount(router, { basePath: "hello" })
server.listen().then(console.log).catch(console.log)
