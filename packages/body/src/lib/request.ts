/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { addRequestField, HTTPException, LRequest, Status, UTF8SearchParams } from "@luftschloss/server"
import "@luftschloss/server"

declare module "@luftschloss/server" {
  interface LRequest {
    json<T>(): Promise<T>

    text(): Promise<string>

    form(): Promise<UTF8SearchParams>
  }

  interface RequestImpl {
    json<T>(): Promise<T>

    text(): Promise<string>

    form(): Promise<UTF8SearchParams>
  }
}

addRequestField<LRequest, "json">("json", {
  value: () => {
    throw new HTTPException(Status.HTTP_500_INTERNAL_SERVER_ERROR, "Please the json body parser to use this function")
  },
  writable: true,
})

addRequestField<LRequest, "text">("text", {
  value: () => {
    throw new HTTPException(Status.HTTP_500_INTERNAL_SERVER_ERROR, "Please the text body parser to use this function")
  },
  writable: true,
})

addRequestField<LRequest, "form">("form", {
  value: () => {
    throw new HTTPException(Status.HTTP_500_INTERNAL_SERVER_ERROR, "Please the form body parser to use this function")
  },
  writable: true,
})
