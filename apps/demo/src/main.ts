import { defaultRouter, defaultServer } from "@luftschloss/core"
import { staticRouter } from "@luftschloss/static"

const server = defaultServer()
server.get("", (request, response) => response.text("hello world"))
const router = defaultRouter()
router.get("/json", (request, response) => response.json({ hello: "world" }))
router.get("/path/{param}/{int:int}", (request, response) => response.json(request.pathParams))
router.get("/html", (request, response) => response.html("<button>hello world</button>"))
router.get("error", (request, response) => {
  response.file("sadf")
  throw new Error("why are you not working")
})

server.mount(router, { basePath: "hello" })
server.mount(staticRouter(""))
server.listen()
