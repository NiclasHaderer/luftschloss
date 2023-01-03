/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { withDefaults } from "@luftschloss/common"
import { Middleware } from "@luftschloss/server"
import Buffer from "buffer"
import { commonFormParserFactory } from "./common"

export type TextParserOptions = {
  maxBodySize: number
  parser: (body: Buffer, encoding: BufferEncoding | undefined) => string
}

export const textParser = (
  contentType: string[] | "*" | string = "text/plain",
  options: Partial<TextParserOptions> = {}
): Middleware => {
  const completeOptions = withDefaults<TextParserOptions>(
    {
      parser: (buffer: Buffer, encoding: BufferEncoding | undefined) => {
        return buffer.toString(encoding)
      },
      maxBodySize: 100,
    },
    options
  )

  return commonFormParserFactory(contentType, {
    ...completeOptions,
    methodName: "text",
    version: "1.0.0",
    name: "text-parser",
  })
}
