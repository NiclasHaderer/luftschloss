/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { HTTPException, LRequest, LResponse, NextFunction, Status } from "@luftschloss/server"
import Buffer from "buffer"
import { assertContentLengthHeader, getBodyContentType, getBodyData } from "./utils"

export type CommonParserOptions = {
  maxBodySize: number
  parser: (body: Buffer, encoding: BufferEncoding | undefined) => object
  methodName: "json" | "form" | "text"
}

export type InternalCommonParserOptions =
  | ({ contentTypes: Set<string>; tryAllContentTypes: false } & CommonParserOptions & {
        methodName: "json" | "form" | "text"
      })
  | ({ tryAllContentTypes: true } & CommonParserOptions & { methodName: "json" | "form" | "text" })

async function commonFormParserMiddleware(
  this: InternalCommonParserOptions,
  next: NextFunction,
  request: LRequest,
  response: LResponse
) {
  assertContentLengthHeader(request, this.maxBodySize)

  let parsed: object | null = null
  request[this.methodName] = async <T>(): Promise<T> => {
    const contentType = getBodyContentType(request)

    if (!this.tryAllContentTypes) {
      if (!contentType) {
        throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Request has not content type header")
      }

      if (!this.contentTypes.has(contentType.type)) {
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

export const commonFormParserFactory = (contentType: string[] | string | "*", options: CommonParserOptions) => {
  let completeOptions: InternalCommonParserOptions
  if (contentType === "*") {
    completeOptions = {
      parser: options.parser,
      maxBodySize: options.maxBodySize * 100,
      tryAllContentTypes: true,
      methodName: options.methodName,
    }
  } else if (typeof contentType === "string") {
    completeOptions = {
      parser: options.parser,
      maxBodySize: options.maxBodySize * 100,
      tryAllContentTypes: false,
      contentTypes: new Set([contentType.toLowerCase().trim()]),
      methodName: options.methodName,
    }
  } else {
    completeOptions = {
      parser: options.parser,
      maxBodySize: options.maxBodySize * 100,
      tryAllContentTypes: false,
      contentTypes: new Set(contentType.map(c => c.toLowerCase().trim())),
      methodName: options.methodName,
    }
  }

  return commonFormParserMiddleware.bind(completeOptions)
}
