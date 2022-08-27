import { apiServer } from "@luftschloss/openapi"
import { luft } from "@luftschloss/validation"

const server = apiServer()
server.get("", {
  url: luft.object({
    hello: luft.string(),
  }),
  response: luft.object({
    hello: luft.string(),
  }),
})

server.listen()
