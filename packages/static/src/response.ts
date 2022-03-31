import "@luftschloss/core"
import { addResponseField, HTTPException, Response, Status } from "@luftschloss/core"
import * as fs from "fs"

declare module "@luftschloss/core" {
  interface Response {
    file(path: string): Response
  }
}

addResponseField<Response, "file">("file", {
  value(path: string): Response {
    // TODO partial content
    // TODO mime types
    // TODO remove .. and other malicious escape attempts  /(?:^|[\\/])\.\.(?:[\\/]|$)/
    if (!fs.existsSync(path)) {
      throw new HTTPException(Status.HTTP_404_NOT_FOUND, `File ${path} was not found`)
    }
    return this.stream(fs.createReadStream(path))
  },
})
