/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { HTTPException, LRequest, LResponse, Status } from "@luftschloss/server"
import { Stats } from "node:fs"
import * as parseRange from "range-parser"
import * as RangeParser from "range-parser"

export const getRange = (req: LRequest, res: LResponse, stats: Stats): RangeParser.Ranges => {
  const rangeHeader: string | null = req.headers.get("Range")
  if (!rangeHeader) {
    const fullRange = [{ start: 0, end: stats.size }] as RangeParser.Ranges
    fullRange.type = "bytes"
    return fullRange
  }

  const result = parseRange.default(stats.size, rangeHeader, { combine: true })
  switch (result) {
    case -1:
      res.headers.append("Content-Range", `bytes */${stats.size}`)
      throw new HTTPException(Status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE)
    case -2:
      throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Range header malformed")
  }

  if (result.type !== "bytes") {
    throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "Only byte ranges are supported")
  }

  res.status(Status.HTTP_206_PARTIAL_CONTENT)
  return result
}

export const addRangeHeaders = (req: LRequest, res: LResponse, header: RangeParser.Ranges, stats: Stats): void => {
  const contentLength = header.reduce((previousValue, currentValue) => {
    return previousValue + currentValue.end - currentValue.start
  }, 0)
  res.headers.append("Content-Length", contentLength)

  for (const { start, end } of header) {
    res.headers.append("Content-Range", `bytes ${start}-${end}/${stats.size}`)
  }
}
