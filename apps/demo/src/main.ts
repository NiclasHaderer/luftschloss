/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { defaultRouter, defaultServer, Request, Response } from "@luftschloss/core"

const server = defaultServer()
server.get("", (request, response) => response.text("hello world"))
const router = defaultRouter()
router.get("/json", (request: Request, response: Response) => {
  console.log(request.url.toJSON())
  response.headers.append("why", "linting error")
  response.json({ hello: "world" })
})
router.get("/path/{param}/{int:int}", (request, response) => response.json(request.pathParams()))
router.get("/html", (request, response) => response.html("<button>hello world</button>"))
router.get("error", (request, response) => {
  throw new Error("why are you not working")
})
//server.pipe(jsonParser())
server.mount(router, { basePath: "hello" })
void server.listen()
