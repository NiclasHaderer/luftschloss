/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import {withDefaults} from "@luftschloss/common";
import {HTTPException, Middleware, Status} from "@luftschloss/server";
import * as Buffer from "node:buffer";
import {commonFormParserFactory} from "./common";

export type JsonParserOptions = {
  maxBodySize: number;
  parser: (body: Buffer, encoding: BufferEncoding | undefined) => object;
};

export const jsonParser = (
  contentType: string[] | "*" | string = "application/json",
  options: Partial<JsonParserOptions> = {}
): Middleware => {
  const completeOptions = withDefaults<JsonParserOptions>(
    {
      maxBodySize: 100,
      parser: (buffer: Buffer, encoding: BufferEncoding | undefined) => {
        try {
          return JSON.parse(buffer.toString(encoding)) as object;
        } catch (e) {
          throw new HTTPException(Status.HTTP_400_BAD_REQUEST, {
            message: "Could not parse json",
            details: (e as Error).message,
          });
        }
      },
    },
    options
  );

  return commonFormParserFactory(contentType, {
    ...completeOptions,
    methodName: "json",
    name: "json-parser",
    version: "1.0.0",
  });
};
