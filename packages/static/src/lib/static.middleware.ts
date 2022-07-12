/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import {
  HTTPException,
  HttpMiddlewareInterceptor,
  LRequest,
  LResponse,
  NextFunction,
  Status,
} from "@luftschloss/server"
import * as fsSync from "fs"
import { Stats } from "node:fs"
import * as path from "path"
import { addRangeHeaders, getRange } from "./content-range"
import { getMimeType } from "./lookup-mime"

type StaticContentOptions = { basePath: string; allowOutsideBasePath?: false } | { allowOutsideBasePath: true }

export async function StaticContentMiddleware(
  this: StaticContentOptions,
  next: NextFunction,
  request: LRequest,
  response: LResponse
): Promise<void> {
  response.file = async (filePath: string): Promise<LResponse> => {
    if (this.allowOutsideBasePath === true) {
      filePath = path.resolve(filePath)
    } else {
      filePath = `${this.basePath}${path.sep}${filePath}`
    }

    let stat: Stats
    try {
      stat = await fsSync.promises.lstat(filePath)
    } catch (e) {
      throw new HTTPException(Status.HTTP_500_INTERNAL_SERVER_ERROR, `File ${filePath} was not found.`)
    }

    // Get and append mime type
    const mime = getMimeType(filePath)
    if (mime) response.headers.append("Content-Type", mime)

    // Get content ranges
    const contentRanges = getRange(request, response, stat)

    // Add the response range headers
    addRangeHeaders(request, response, contentRanges, stat)

    // Extract the requested ranges from the file
    const streams = contentRanges.map(range =>
      fsSync.createReadStream(filePath, {
        start: range.start,
        end: range.end,
      })
    )

    return response.stream(streams)
  }

  await next(request, response)
}

export const staticContent = ({ ...options }: StaticContentOptions): HttpMiddlewareInterceptor => {
  if (options.allowOutsideBasePath === false) {
    options.basePath = path.resolve(options.basePath)
    const stat = fsSync.lstatSync(options.basePath)
    if (!stat.isDirectory()) {
      throw new Error(`Cannot serve static files from ${options.basePath}. Path is not a directory`)
    }
  }

  return StaticContentMiddleware.bind(options)
}
