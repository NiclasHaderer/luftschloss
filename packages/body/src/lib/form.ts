/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { saveObject, withDefaults } from "@luftschloss/core"
import {
  HTTPException,
  HttpMiddlewareInterceptor,
  LRequest,
  LResponse,
  NextFunction,
  Status,
  UTF8SearchParams,
} from "@luftschloss/server"
import Buffer from "buffer"
import { assertContentLengthHeader, getBodyContentType, getBodyData } from "./common"

export type FormParserOptions = {
  maxBodySize: number
  parser: (body: Buffer, encoding: BufferEncoding | undefined) => object
}

export type InternalFormParserOptions = { contentType: Set<string> } & FormParserOptions

async function FormParserMiddleware(
  this: InternalFormParserOptions,
  next: NextFunction,
  request: LRequest,
  response: LResponse
) {
  assertContentLengthHeader(request, this.maxBodySize)
  let parsed: object | null = null
  request.body = async <T>(): Promise<T> => {
    const contentType = getBodyContentType(request)
    if (!contentType) {
      throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Request has not content type header")
    }

    if (!this.contentType.has(contentType.type)) {
      throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Request has wrong content type header")
    }

    if (parsed === null) {
      const buffer = await getBodyData(request, this.maxBodySize)
      parsed = this.parser(buffer, contentType.encoding)
    }

    return parsed as unknown as T
  }

  await next(request, response)
}

export const formParser = (
  contentType = ["application/json"],
  options: Partial<FormParserOptions>
): HttpMiddlewareInterceptor => {
  const completeOptions = withDefaults<FormParserOptions>(options, {
    parser: (buffer: Buffer, encoding: BufferEncoding | undefined) => {
      const str = buffer.toString(encoding)
      const url = new UTF8SearchParams(str)
      const encodedBody = saveObject()

      for (const key of url.values()) {
        const values = url.getAll(key)
        encodedBody[key] = values.length === 1 ? values[0] : values
      }
      return encodedBody
    },
    maxBodySize: 100000,
  })

  return FormParserMiddleware.bind({
    parser: completeOptions.parser,
    maxBodySize: completeOptions.maxBodySize * 100,
    contentType: new Set(contentType.map(c => c.toLowerCase().trim())),
  })
}
