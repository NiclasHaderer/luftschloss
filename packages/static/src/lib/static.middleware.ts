/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { HTTPException, LRequest, LResponse, Middleware, NextFunction, Status } from "@luftschloss/server"
import * as fsSync from "fs"
import { Stats } from "node:fs"
import * as path from "path"
import { addRangeHeaders, getRange } from "./content-range"
import { getMimeType } from "./lookup-mime"

export type StaticContentOptions =
  | {
      basePath: string
      allowOutsideBasePath?: false
    }
  | {
      allowOutsideBasePath: true
    }

type InternalStaticContentOptions = StaticContentOptions & {
  pathNotFound: (request: LRequest, response: LResponse, absPath: string) => LResponse | Promise<LResponse>
}

const staticContentMiddleware = (options: InternalStaticContentOptions): Middleware => {
  return {
    name: "static-content",
    version: "1.0.0",
    handle: async (next: NextFunction, request, response) => {
      response.file = async (filePath: string): Promise<LResponse> => {
        // If you allow a path outside the base path, we resolve the path to an absolute path
        if (options.allowOutsideBasePath) {
          filePath = path.resolve(filePath)
        } else {
          filePath = `${options.basePath}${path.sep}${filePath}`
        }

        let stat: Stats
        try {
          stat = await fsSync.promises.lstat(filePath)
        } catch (e) {
          await options.pathNotFound(request, response, filePath)
          return response
        }

        // Get and append mime type
        const mime = getMimeType(filePath)
        if (mime) response.headers.append("Content-Type", mime)

        // Get content ranges
        const contentRanges = getRange(request, response, stat)

        // If the response is a partial response add the right status code
        if (contentRanges.partial) response.status(Status.HTTP_206_PARTIAL_CONTENT)

        // Add the response range headers
        addRangeHeaders(request, response, contentRanges, stat)

        // Extract the requested byte ranges from the file
        const streams = contentRanges.parts.map(range =>
          fsSync.createReadStream(filePath, {
            start: range.start,
            end: range.end,
          })
        )

        return response.stream(streams)
      }

      await next(request, response)
    },
  }
}

export const staticContent = (
  { ...options }: StaticContentOptions,
  pathNotFound?: (request: LRequest, response: LResponse, absPath: string) => LResponse | Promise<LResponse>
): Middleware => {
  if (!options.allowOutsideBasePath) {
    options.basePath = path.resolve(options.basePath)
    const stat = fsSync.lstatSync(options.basePath)
    if (!stat.isDirectory()) {
      throw new Error(`Cannot serve static files from ${options.basePath}. Path is not a directory`)
    }
  }

  return staticContentMiddleware({
    ...options,
    pathNotFound:
      pathNotFound ??
      ((_, __, filePath) => {
        throw new HTTPException(Status.HTTP_500_INTERNAL_SERVER_ERROR, `File ${filePath} was not found.`)
      }),
  })
}
