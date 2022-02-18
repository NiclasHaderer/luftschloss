import { corsMiddleware } from "ts-server/middleware/cors.middleware"
import { createRouter } from "ts-server/core/impl/router"
import { createServer } from "ts-server/core/impl/server"
import { loggerMiddleware } from "ts-server/middleware/logger.middleware"

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
