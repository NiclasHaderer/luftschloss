/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { withDefaults } from "@luftschloss/core"
import { HttpMiddlewareInterceptor, UTF8SearchParams } from "@luftschloss/server"
import Buffer from "buffer"
import { commonFormParserFactory } from "./common"

export type TextParserOptions = {
  maxBodySize: number
  parser: (body: Buffer, encoding: BufferEncoding | undefined) => object
}

export const textParser = (
  contentType: string[] | "*" | string = "text/plain",
  options: Partial<TextParserOptions>
): HttpMiddlewareInterceptor => {
  const completeOptions = withDefaults<TextParserOptions>(options, {
    parser: (buffer: Buffer, encoding: BufferEncoding | undefined) => {
      const str = buffer.toString(encoding)
      return new UTF8SearchParams(str).asObject()
    },
    maxBodySize: 100,
  })

  return commonFormParserFactory(contentType, { ...completeOptions, methodName: "text" })
}
