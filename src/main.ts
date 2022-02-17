import { createServer } from "./core/impl/server"
import { createRouter } from "./core/impl/router"
import { HTTPException } from "./core/impl/http-exception"
import { Status } from "./core/impl/status"

const server = createServer()
const router = createRouter()
router.get("", request => request.respondText(200, "hello world"))
router.get("/json", request => request.respondJson(200, { hello: "world" }))
router.get("error", request => {
  throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "why are you not working")
})
server.mount(router, { basePath: "hello" })
server.listen()
