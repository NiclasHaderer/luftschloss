import "@luftschloss/core"
import { extendResponse, Response } from "@luftschloss/core"

declare module "@luftschloss/core" {
  interface Response {
    file(path: string): Response
  }
}

extendResponse<Response>({
  file(path: string): Response {
    // TODO
    return this
  },
})
