/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { addResponseField, HTTPException, LResponse, Status } from "@luftschloss/server"
import "@luftschloss/server"

declare module "@luftschloss/server" {
  //eslint-disable-next-line no-shadow
  interface LResponse {
    file(path: string): Promise<LResponse>
  }

  interface ResponseImpl {
    file(path: string): Promise<LResponse>
  }
}

addResponseField<LResponse, "file">("file", {
  value: () => {
    throw new HTTPException(
      Status.HTTP_500_INTERNAL_SERVER_ERROR,
      "Please use one of the static content middleware in order to use that function"
    )
  },
  writable: true,
})
