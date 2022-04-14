/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import * as parseRange from "range-parser"
import { Stats } from "node:fs"
import { HTTPException, Request, Response, Status } from "@luftschloss/core"
import * as RangeParser from "range-parser"

export const getRange = (rangeHeader: string | null, stats: Stats): RangeParser.Ranges => {
  if (!rangeHeader) {
    const fullRange = [{ start: 0, end: stats.size }] as RangeParser.Ranges
    fullRange.type = "bytes"
    return fullRange
  }

  const result = parseRange.default(stats.size, rangeHeader, { combine: true })
  switch (result) {
    case -1:
      throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Header range cannot be satisfied")
    case -2:
      throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Range header malformed")
  }

  if (result.type !== "bytes") {
    throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Only byte ranges are supported")
  }
  return result
}

export const addRangeHeaders = (req: Request, res: Response, header: RangeParser.Ranges): void => {
  // TODO
}
