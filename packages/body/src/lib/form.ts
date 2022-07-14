/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { withDefaults } from "@luftschloss/core"
import { Middleware, UTF8SearchParams } from "@luftschloss/server"
import Buffer from "buffer"
import { commonFormParserFactory } from "./common"

export type FormParserOptions = {
  maxBodySize: number
  parser: (body: Buffer, encoding: BufferEncoding | undefined) => object
}

export const formParser = (
  contentType: string[] | "*" | string = "application/x-www-form-urlencoded",
  options: Partial<FormParserOptions>
): Middleware => {
  const completeOptions = withDefaults<FormParserOptions>(options, {
    parser: (buffer: Buffer, encoding: BufferEncoding | undefined) => {
      const str = buffer.toString(encoding)
      return new UTF8SearchParams(str).asObject()
    },
    maxBodySize: 100,
  })

  return commonFormParserFactory(contentType, {
    ...completeOptions,
    methodName: "form",
    version: "1.0.0",
    name: "form-parser",
  })
}
