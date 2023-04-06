/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { HTTPException, LRequest, LResponse, Status } from "@luftschloss/server";
import { Stats } from "node:fs";

export type ContentRange = { type: string; parts: { start: number; end: number }[]; partial: boolean };

export const parseRange = (totalSize: number, header: string): ContentRange => {
  const eqIndex = header.indexOf("=");
  if (eqIndex === -1) {
    throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "range header malformed");
  }

  const type = header.slice(0, eqIndex);
  const rawRanges = header.slice(eqIndex + 1).split(",");
  const ranges: ContentRange["parts"] = [];

  for (const rawRange of rawRanges) {
    const range = rawRange.split("-");
    const startStr = range[0].trim();
    const endStr = range[1].trim();
    let start = parseInt(startStr, 10);
    let end = parseInt(endStr, 10);

    if (startStr === "" && !isNaN(end)) {
      start = totalSize - end;
      end = totalSize - 1;
    } else if (endStr === "" && !isNaN(start)) {
      end = totalSize - 1;
    }
    end = Math.min(end, totalSize - 1);
    if (start < 0) start = 0;

    if ((isNaN(start) && isNaN(end)) || start > end) {
      continue;
    }
    ranges.push({ start, end });
  }

  if (ranges.length === 0) {
    throw new HTTPException(Status.HTTP_400_BAD_REQUEST, `valid ranges are from 0 to ${totalSize - 1}`);
  }

  // Combine overlapping ranges
  for (let i = 0; i < ranges.length; i++) {
    for (let k = 0; k < ranges.length; k++) {
      // We combine the ranges under these conditions:
      // 1. The start of k is between the start and end of i.
      // 2. The end of k is between the start and end of i.
      // 3. The start of k is before the start of i and the end of k is after the end of i.
      // 4. Then start of k is one larger than the end of i.
      // 5. Then end of k is one smaller than the start of i.
      // In all these cases we select the smaller start and the larger end.
      if (i === k) continue;

      if (
        (ranges[k].start >= ranges[i].start && ranges[k].start <= ranges[i].end) ||
        (ranges[k].end >= ranges[i].start && ranges[k].end <= ranges[i].end) ||
        (ranges[k].start <= ranges[i].start && ranges[k].end >= ranges[i].end) ||
        ranges[k].start === ranges[i].end + 1 ||
        ranges[k].end === ranges[i].start - 1
      ) {
        ranges[i].start = Math.min(ranges[k].start, ranges[i].start);
        ranges[i].end = Math.max(ranges[k].end, ranges[i].end);
        ranges.splice(k, 1);
        k--;
      }
    }
  }

  const complete = ranges.length === 1 && ranges[0].start === 0 && ranges[0].end === totalSize - 1;
  return {
    type,
    parts: ranges,
    partial: !complete,
  };
};

export const getRange = (req: LRequest, res: LResponse, stats: Stats): ContentRange => {
  const rangeHeader = req.headers.get("Range");
  if (!rangeHeader) {
    return { type: "bytes", parts: [{ start: 0, end: stats.size - 1 }], partial: false };
  }

  const result = parseRange(stats.size, rangeHeader);

  if (result.type !== "bytes") {
    throw new HTTPException(Status.HTTP_400_BAD_REQUEST, "only byte ranges are supported");
  }

  return result;
};

export const addRangeResponseHeaders = (req: LRequest, res: LResponse, header: ContentRange, stats: Stats): void => {
  const contentLength = header.parts.reduce((previousValue, currentValue) => {
    return previousValue + currentValue.end - currentValue.start;
  }, 0);
  res.headers.append("Content-Length", contentLength);

  for (const { start, end } of header.parts) {
    res.headers.append("Content-Range", `bytes ${start}-${end}/${stats.size}`);
  }
};
// if (
//   (ranges[k].start >= ranges[i].start && ranges[k].start <= ranges[i].end) ||
//   (ranges[k].end >= ranges[i].start && ranges[k].end <= ranges[i].end) ||
//   (ranges[k].start <= ranges[i].start && ranges[k].end >= ranges[i].end)
// ) {
//   ranges[i].start = Math.min(ranges[k].start, ranges[i].start);
//   ranges[i].end = Math.max(ranges[k].end, ranges[i].end);
//   ranges.splice(k, 1);
//   k--;
// }
