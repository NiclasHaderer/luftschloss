import { createServer } from "./impl/server"
import { createRouter } from "./impl/router"
import { ServerError } from "./impl/server-error"

const server = createServer()
const router = createRouter()
router.get("", request => request.respondText(200, "hello world"))
router.get("/json", request => request.respondJson(200, { hello: "world" }))
router.get("error", request => {
  throw new ServerError(400, "why are you not working")
})
server.mount(router, { basePath: "hello" })
server.listen()
