/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { withDefaults } from "@luftschloss/common"
import { Middleware } from "@luftschloss/server"
import * as Buffer from "buffer"
import { commonFormParserFactory } from "./common"

export type JsonParserOptions = {
  maxBodySize: number
  parser: (body: Buffer, encoding: BufferEncoding | undefined) => object
}

export const jsonParser = (
  contentType: string[] | "*" | string = "application/json",
  options: Partial<JsonParserOptions> = {}
): Middleware => {
  const completeOptions = withDefaults<JsonParserOptions>(options, {
    maxBodySize: 100,
    parser: (buffer: Buffer, encoding: BufferEncoding | undefined) => JSON.parse(buffer.toString(encoding)) as object,
  })

  return commonFormParserFactory(contentType, {
    ...completeOptions,
    methodName: "json",
    name: "json-parser",
    version: "1.0.0",
  })
}
