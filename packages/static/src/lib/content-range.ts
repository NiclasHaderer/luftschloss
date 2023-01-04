/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { HTTPException, LRequest, LResponse, Status } from "@luftschloss/server";
import { Stats } from "node:fs";
import * as parseRange from "range-parser";

type ContentRange = { type: string; parts: { start: number; end: number }[]; partial: boolean };

export const getRange = (req: LRequest, res: LResponse, stats: Stats): ContentRange => {
  const rangeHeader = req.headers.get("Range");
  if (!rangeHeader) {
    return { type: "bytes", parts: [{ start: 0, end: stats.size }], partial: false };
  }

  const result = parseRange.default(stats.size, rangeHeader, { combine: true });
  switch (result) {
    case -1:
      res.headers.append("Content-Range", `bytes */${stats.size}`);
      throw new HTTPException(Status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE);
    case -2:
      throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Range header malformed");
  }

  if (result.type !== "bytes") {
    throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Only byte ranges are supported");
  }

  return {
    partial: true,
    parts: [...result],
    type: "bytes",
  };
};

export const addRangeHeaders = (req: LRequest, res: LResponse, header: ContentRange, stats: Stats): void => {
  const contentLength = header.parts.reduce((previousValue, currentValue) => {
    return previousValue + currentValue.end - currentValue.start;
  }, 0);
  res.headers.append("Content-Length", contentLength);

  for (const { start, end } of header.parts) {
    res.headers.append("Content-Range", `bytes ${start}-${end}/${stats.size}`);
  }
};
