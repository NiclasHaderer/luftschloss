import { createRouter } from "ts-server/core/impl/router"
import { createServer } from "ts-server/core/impl/server"

const server = createServer()
server.get("", (request, response) => response.text("hello world"))
const router = createRouter()
router.get("/json", (request, response) => response.json({ hello: "world" }))
router.get("/html", (request, response) => response.html("<button>hello world</button>"))
router.get("error", () => {
  throw new Error("why are you not working")
})
server.mount(router, { basePath: "hello" })
server.listen()
