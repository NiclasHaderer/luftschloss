import "@luftschloss/core"
import { addResponseField, HTTPException, Response, Status } from "@luftschloss/core"
import * as fs from "fs"

declare module "@luftschloss/core" {
  //eslint-disable-next-line no-shadow
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
    //eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
    return this.stream(fs.createReadStream(path))
  },
})
