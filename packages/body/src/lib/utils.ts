/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { HTTPException, LRequest, Status } from "@luftschloss/server";
import http from "node:http";
import { parseContentType } from "@luftschloss/common";

export const assertContentLengthHeader = (request: LRequest, maxBodySize: number): void => {
  let length = parseInt((request.headers.get("Content-Length") as string | null) || "0");
  if (isNaN(length)) {
    length = 0;
  }

  if (length > maxBodySize) {
    throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Request body to large");
  }
};

export const getBodyData = (raw: http.IncomingMessage, maxBodySize: number) => {
  return new Promise<Buffer>(resolve => {
    const buffers: Buffer[] = [];

    const currentBodySize = () => {
      return buffers.reduce((previousValue, currentValue) => {
        return previousValue + currentValue.length;
      }, 0);
    };

    const concatBuffer = (b: Buffer) => {
      if (currentBodySize() > maxBodySize) {
        throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Request body to large");
      }
      buffers.push(b);
    };

    raw.on("data", concatBuffer);

    raw.on("end", () => resolve(Buffer.concat(buffers)));
  });
};

export const getBodyContentType = (
  request: LRequest
): null | { type: string; encoding: BufferEncoding | undefined } => {
  const contentTypeHeader = request.headers.get("Content-Type");
  if (!contentTypeHeader) return null;
  return parseContentType(contentTypeHeader) as { type: string; encoding: BufferEncoding | undefined };
};
