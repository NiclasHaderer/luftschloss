/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import * as path from "path"
import {
  Headers,
  HTTPException,
  HttpMiddlewareInterceptor,
  NextFunction,
  Request,
  Response,
  Status,
} from "@luftschloss/core"
import * as fsSync from "fs"
import { getMimeType } from "./lookup-mime"
import { Stats } from "node:fs"
import { addRangeHeaders, getRange } from "./content-range"

type StaticContentOptions = { basePath: string; allowOutsideBasePath?: false } | { allowOutsideBasePath: true }

export function StaticContentMiddleware(
  this: StaticContentOptions,
  next: NextFunction,
  request: Request,
  response: Response
) {
  response.file = async (filePath: string): Promise<Response> => {
    if (this.allowOutsideBasePath) {
      filePath = path.resolve(filePath)
    } else {
      filePath = `${this.basePath}${path.sep}${filePath}`
    }

    let stat: Stats
    try {
      stat = await fsSync.promises.lstat(filePath)
    } catch (e) {
      throw new HTTPException(Status.HTTP_500_INTERNAL_SERVER_ERROR, `File ${filePath} was not found`)
    }

    // Get and append mime type
    const mime = getMimeType(filePath)
    if (mime) (response.headers as Headers).append("Content-Type", mime)

    const range = getRange(request.headers.get("Range"), stat)
    addRangeHeaders(request, response, range)
    const streams = range.map(r => fsSync.createReadStream(filePath, r))

    //eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
    return response.stream(streams)
  }
}

export const staticContent = ({ ...options }: StaticContentOptions): HttpMiddlewareInterceptor => {
  if (!options.allowOutsideBasePath) {
    options.basePath = path.resolve(options.basePath)
    const stat = fsSync.lstatSync(options.basePath)
    if (!stat.isDirectory()) {
      throw new Error(`Cannot serve static files from ${options.basePath}. Path is not a directory`)
    }
  }

  return StaticContentMiddleware.bind(options)
}
