/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { addResponseField, HTTPException, Response, Status } from "@luftschloss/core"

declare module "@luftschloss/core" {
  //eslint-disable-next-line no-shadow
  interface Response {
    file(path: string): Response
  }
}

addResponseField<Response, "file">("file", {
  value: () => {
    throw new HTTPException(
      Status.HTTP_500_INTERNAL_SERVER_ERROR,
      "Please use one of the static content middleware in order to use that function"
    )
  },
})
