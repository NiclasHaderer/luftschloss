/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { addRequestField, HTTPException, Request, Status } from "@luftschloss/core"

declare module "@luftschloss/core" {
  //eslint-disable-next-line no-shadow
  interface Request {
    body<T>(): Promise<T>
  }
}
addRequestField<Request, "body">("body", {
  value: () => {
    throw new HTTPException(
      Status.HTTP_500_INTERNAL_SERVER_ERROR,
      "Please use one of one of the body parser middlewares in order to use that function"
    )
  },
})
