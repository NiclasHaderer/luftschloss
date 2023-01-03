/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { HTTPException, LRequest, LResponse, Middleware, NextFunction, Status } from "@luftschloss/server"
import Buffer from "buffer"
import { assertContentLengthHeader, getBodyContentType, getBodyData } from "./utils"

export type CommonParserOptions = {
  maxBodySize: number
  parser: (body: Buffer, encoding: BufferEncoding | undefined) => unknown
  methodName: "json" | "form" | "text" | "buffer"
  name: string
  version: string
}

export type InternalCommonParserOptions =
  | ({ contentTypes: Set<string>; tryAllContentTypes: false } & CommonParserOptions)
  | ({ tryAllContentTypes: true } & CommonParserOptions)

const commonFormParserMiddleware = (options: InternalCommonParserOptions): Middleware => {
  return {
    name: options.name,
    version: options.version,
    handle: async (next: NextFunction, request: LRequest, response: LResponse) => {
      assertContentLengthHeader(request, options.maxBodySize)
      // TODO store the buffer in the request object
      let parsed: unknown | null = null
      request[options.methodName] = async <T>(): Promise<T> => {
        const contentType = getBodyContentType(request)

        if (!options.tryAllContentTypes) {
          if (!contentType) {
            throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Request has not content type header")
          }

          if (!options.contentTypes.has(contentType.type)) {
            throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Request has wrong content type header")
          }
        }

        if (parsed === null) {
          const buffer = await getBodyData(request.raw, options.maxBodySize)
          parsed = options.parser(buffer, contentType?.encoding)
        }

        return parsed as unknown as T
      }

      await next(request, response)
    },
  }
}

export const commonFormParserFactory = (contentType: string[] | string | "*", options: CommonParserOptions) => {
  let completeOptions: InternalCommonParserOptions
  if (contentType === "*") {
    completeOptions = {
      ...options,
      maxBodySize: options.maxBodySize * 100,
      tryAllContentTypes: true,
    }
  } else if (typeof contentType === "string") {
    completeOptions = {
      ...options,
      maxBodySize: options.maxBodySize * 100,
      tryAllContentTypes: false,
      contentTypes: new Set([contentType.toLowerCase().trim()]),
    }
  } else {
    completeOptions = {
      ...options,
      maxBodySize: options.maxBodySize * 100,
      tryAllContentTypes: false,
      contentTypes: new Set(contentType.map(c => c.toLowerCase().trim())),
    }
  }

  return commonFormParserMiddleware(completeOptions)
}
