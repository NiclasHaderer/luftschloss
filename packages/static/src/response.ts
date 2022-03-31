import "@luftschloss/core"
import { addResponseField, Response } from "@luftschloss/core"

declare module "@luftschloss/core" {
  interface Response {
    file(path: string): Response
  }
}

addResponseField<Response, "file">("file", {
  value(fileName: string): Response {
    return this
  },
})
