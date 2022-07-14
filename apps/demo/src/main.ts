/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

//import { jsonParser } from "@luftschloss/body"
//import { defaultRouter, defaultServer, LRequest, LResponse } from "@luftschloss/server"
//import { staticContent } from "@luftschloss/static"
//
//const server = defaultServer().pipe(jsonParser(), staticContent({ allowOutsideBasePath: true }))
//
//server.get("", (request, response) => response.text("hello world").end())
//
//const router = defaultRouter()
//router.get("/json", async (request: LRequest, response: LResponse) => {
//  response.headers.append("why", "linting error")
//  await response.json({ hello: "world" }).end()
//})
//router.get("/path/{param}/{int:int}", (request, response) => response.json(request.pathParams()).end())
//router.get("/html", (request, response) => response.html("<button>hello world</button>").end())
//
//const router2 = defaultRouter()
//router2.get("2", (req: LRequest, res: LResponse) => res.json({ hello: "asdf" }).end())
//router.mount(router2, { basePath: "test" })
//
//server.mount(router, { basePath: "hello" })
//server.listen().then(console.log).catch(console.trace)

import { RequestImpl } from "@luftschloss/server"
import { IncomingMessage } from "http"
import { Socket } from "net"

const req = new RequestImpl(new IncomingMessage(new Socket()))
console.log(req.url)
