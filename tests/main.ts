import { defaultServer } from "../src/core/server"
import { defaultRouter } from "../src/router/default.router"

const server = defaultServer()
server.get("", (request, response) => response.text("hello world"))
const router = defaultRouter()
router.get("/json", (request, response) => response.json({ hello: "world" }))
router.get("/path/{param}/{int:int}", (request, response) => response.json(request.pathParams))
router.get("/html", (request, response) => response.html("<button>hello world</button>"))
router.get("error", () => {
  throw new Error("why are you not working")
})

server.mount(router, { basePath: "hello" })
server.listen()
