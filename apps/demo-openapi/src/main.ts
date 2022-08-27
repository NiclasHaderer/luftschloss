import { apiServer } from "@luftschloss/openapi"
import { luft } from "@luftschloss/validation"

const main = async () => {
  const server = apiServer()
  server
    .get("", {
      url: luft.object({
        hello: luft.string(),
      }),
      response: luft.object({
        hello: luft.string(),
      }),
    })
    .handle((url, body) => {
      return url
    })
  server.listen()
}
main()
