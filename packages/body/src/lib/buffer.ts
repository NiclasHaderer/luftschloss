/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { Middleware } from "@luftschloss/server";
import { commonFormParserFactory } from "./common";

export type BufferParserOptions = {
  maxBodySize: number;
  parser: (body: Buffer) => { buffer: Buffer; encoding?: BufferEncoding };
};

export const bufferParser = (
  contentType: string[] | "*" | string = "*",
  options: Partial<BufferParserOptions> = {}
): Middleware => {
  const completeOptions = {
    maxBodySize: 100,
    parser: (buffer: Buffer, encoding?: BufferEncoding) => ({ buffer, encoding }),
    ...options,
  };

  return commonFormParserFactory(contentType, {
    ...completeOptions,
    methodName: "buffer",
    name: "buffer-parser",
    version: "1.0.0",
  });
};
