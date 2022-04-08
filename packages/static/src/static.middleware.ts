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
  withDefaults,
} from "@luftschloss/core"
import * as fs from "fs"
import { getMimeType } from "./lookup-mime"
import * as assert from "assert"

type StaticContentOptions = { allowOutsideBasePath: boolean; followSymlinks: boolean }
type InternalStaticContentOptions = StaticContentOptions & { basePath: string }

export function StaticContentMiddleware(
  this: InternalStaticContentOptions,
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

    try {
      const stat = await fs.promises.stat(filePath)

      // Follow symlinks only if follow symlink is enabled
      assert.strictEqual(stat.isSymbolicLink() && !this.followSymlinks, true)

      // TODO check if you have to resolve a symlink in order to read the file contents
      // TODO symlink into nothing
      // TODO symlink link to symlink
    } catch (e) {
      // TODO this is an internal error
      throw new HTTPException(Status.HTTP_404_NOT_FOUND, `File ${filePath} was not found`)
    }

    // Get and append mime type
    const mime = getMimeType(filePath)
    if (mime) (response.headers as Headers).append("Content-Type", mime)

    //eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
    return response.stream(fs.createReadStream(filePath))
  }
}

export const staticContent = (basePath: string, options: Partial<StaticContentOptions>): HttpMiddlewareInterceptor => {
  basePath = path.resolve(basePath)
  const fullOptions = withDefaults<InternalStaticContentOptions>(
    { ...options, basePath: path.resolve(basePath) },
    {
      allowOutsideBasePath: false,
      basePath: path.resolve(process.cwd()),
      followSymlinks: false,
    }
  )

  return StaticContentMiddleware.bind(fullOptions)
}
