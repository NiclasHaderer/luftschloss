/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import {
  HTTPException,
  HttpMiddlewareInterceptor,
  LRequest,
  LResponse,
  NextFunction,
  Status,
  withDefaults,
} from "@luftschloss/core"
import * as Buffer from "buffer"
import { assertContentLengthHeader, getBodyContentType, getBodyData } from "./common"

export type JsonParserOptions = {
  maxBodySize: number
  parser: (body: Buffer, encoding: BufferEncoding | undefined) => object
}

export type InternalJsonParserOptions =
  | ({ contentType: Set<string> } & JsonParserOptions)
  | ({ tryAllContentTypes: true } & JsonParserOptions)

async function JsonParserMiddleware(
  this: InternalJsonParserOptions,
  next: NextFunction,
  request: LRequest,
  response: LResponse
) {
  assertContentLengthHeader(request, this.maxBodySize)

  let parsed: object | null = null
  request.body = async <T>(): Promise<T> => {
    const contentType = getBodyContentType(request)

    if (!("tryAllContentTypes" in this)) {
      if (!contentType) {
        throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Request has not content type header")
      }

      if (!this.contentType.has(contentType.type)) {
        throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Request has wrong content type header")
      }
    }

    if (parsed === null) {
      const buffer = await getBodyData(request, this.maxBodySize)
      parsed = this.parser(buffer, contentType?.encoding)
    }

    return parsed as unknown as T
  }

  await next(request, response)
}

export const jsonParser = (
  contentType: string[] | "*" = ["application/json"],
  options: Partial<JsonParserOptions> = {}
): HttpMiddlewareInterceptor => {
  const completeOptions = withDefaults<JsonParserOptions>(options, {
    maxBodySize: 100,
    parser: (buffer: Buffer, encoding: BufferEncoding | undefined) => JSON.parse(buffer.toString(encoding)) as object,
  })

  let t: InternalJsonParserOptions
  if (contentType === "*") {
    t = {
      parser: completeOptions.parser,
      maxBodySize: completeOptions.maxBodySize * 100,
      tryAllContentTypes: true,
    }
  } else {
    t = {
      parser: completeOptions.parser,
      maxBodySize: completeOptions.maxBodySize * 100,
      contentType: new Set(contentType.map(c => c.toLowerCase().trim())),
    }
  }

  return JsonParserMiddleware.bind(t)
}
