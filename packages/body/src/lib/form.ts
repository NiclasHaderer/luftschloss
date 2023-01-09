/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import {UTF8SearchParams, withDefaults} from "@luftschloss/common";
import {HTTPException, Middleware, Status} from "@luftschloss/server";
import Buffer from "node:buffer";
import {commonFormParserFactory} from "./common";

export type FormParserOptions = {
  maxBodySize: number;
  parser: (body: Buffer, encoding: BufferEncoding | undefined) => object;
};

export const formParser = (
  contentType: string[] | "*" | string = "application/x-www-form-urlencoded",
  options: Partial<FormParserOptions> = {}
): Middleware => {
  const completeOptions = withDefaults<FormParserOptions>(
    {
      parser: (buffer: Buffer, encoding: BufferEncoding | undefined): UTF8SearchParams => {
        const str = buffer.toString(encoding);
        try {
          return new UTF8SearchParams(str);
        } catch (e) {
          throw new HTTPException(Status.HTTP_400_BAD_REQUEST, {
            message: "Could not parse form data",
            details: (e as Error).message,
          });
        }
      },
      maxBodySize: 100,
    },
    options
  );

  return commonFormParserFactory(contentType, {
    ...completeOptions,
    methodName: "form",
    version: "1.0.0",
    name: "form-parser",
  });
};
