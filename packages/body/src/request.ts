/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { addRequestField, HTTPException, LRequest, Status } from "@luftschloss/server"
import "@luftschloss/server"

declare module "@luftschloss/server" {
  //eslint-disable-next-line no-shadow
  interface LRequest {
    body<T>(): Promise<T>
  }
}
addRequestField<LRequest, "body">("body", {
  value: () => {
    throw new HTTPException(
      Status.HTTP_500_INTERNAL_SERVER_ERROR,
      "Please use one of one of the body parser middlewares in order to use that function"
    )
  },
  writable: true,
})
