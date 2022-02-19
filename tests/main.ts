import { createServer } from "../src/core/server"
import { createRouter } from "../src/core/router"

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
