import { createServer } from "./core/impl/server"
import { createRouter } from "./core/impl/router"
import { loggerMiddleware } from "./middleware/logger.middleware"
import { corsMiddleware } from "./middleware/cors.middleware"

const server = createServer()
const router = createRouter()
router.get("", (request, response) => response.text("hello world"))
router.get("/json", (request, response) => response.json({ hello: "world" }))
router.get("/html", (request, response) => response.html("<button>hello world</button>"))
router.get("error", () => {
  throw new Error("why are you not working")
})
server.mount(router, { basePath: "hello" })
server.pipe(loggerMiddleware()).pipe(corsMiddleware())
server.listen()
