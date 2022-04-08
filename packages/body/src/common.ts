/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { HTTPException, Request, Status } from "@luftschloss/core"
import * as contentType from "content-type"

export const assertContentLengthHeader = (request: Request, maxBodySize: number): void => {
  let length = parseInt(request.headers.get("Content-Length") || "0")
  if (isNaN(length)) {
    length = 0
  }

  if (length > maxBodySize) {
    throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Request body to large")
  }
}

export const getBodyData = ({ raw, headers }: Request, maxBodySize: number) => {
  return new Promise<Buffer>(resolve => {
    const buffers: Buffer[] = []

    const currentBodySize = () => {
      return buffers.reduce((previousValue, currentValue) => {
        return previousValue + currentValue.length
      }, 0)
    }

    const concatBuffer = (b: Buffer) => {
      if (currentBodySize() > maxBodySize) {
        throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Request body to large")
      }
      buffers.push(b)
    }

    raw.on("data", concatBuffer)

    raw.on("end", () => resolve(Buffer.concat(buffers)))
  })
}

export const getBodyContentType = (request: Request): null | { type: string; encoding: BufferEncoding | undefined } => {
  const contentTypeHeader = request.headers.get("Content-Type")
  if (!contentTypeHeader) return null
  const parsed = contentType.parse(contentTypeHeader)

  return {
    type: parsed.type.toLowerCase().trim(),
    encoding: isBufferEncoding(parsed.parameters.encoding)
      ? (parsed.parameters.encoding.toLowerCase() as BufferEncoding)
      : undefined,
  }
}

const isBufferEncoding = (encoding: string): encoding is BufferEncoding => {
  encoding = (encoding || "").toLowerCase()
  return (
    encoding === "ascii" ||
    encoding === "ascii" ||
    encoding === "utf8" ||
    encoding === "utf-8" ||
    encoding === "utf16le" ||
    encoding === "ucs2" ||
    encoding === "ucs-8" ||
    encoding === "base64" ||
    encoding === "base64url" ||
    encoding === "latin1" ||
    encoding === "binary" ||
    encoding === "hex"
  )
}
