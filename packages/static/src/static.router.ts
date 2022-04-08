/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import {
  BaseRouter,
  HTTPException,
  isProduction,
  Request,
  Response,
  Router,
  Status,
  withDefaults,
} from "@luftschloss/core"
import * as fsSync from "fs"
import { promises as fs, Stats } from "fs"
import "./static.middleware"
import path from "path"
import { staticContent } from "./static.middleware"

type InternalStaticRouterProps = { useIndexFile: boolean; indexFile: string }
type StaticRouterProps = InternalStaticRouterProps & { followSymLinks: boolean }

export class StaticRouter extends BaseRouter implements Router {
  private readonly folderPath: string

  public constructor(folderPath: string, private options: InternalStaticRouterProps) {
    super()
    // path.resolve has not trailing / at the end, so add it
    this.folderPath = `${path.resolve(folderPath)}${path.sep}`
    this._routeCollector.add("{path:path}", "GET", this.handlePath.bind(this))
    // TODO HEAD response
    // TODO not modified response
  }

  protected async handlePath(request: Request, response: Response): Promise<void> {
    // Get the file path and replace a leading / with noting (folderPath already has a / at the end)
    const filePath = request.pathParams<{ path: string }>().path.replace(/^\//, "")

    // Convert the file path to an absolute path
    let absPath = this.mergePaths(filePath)

    try {
      // Throws if file does not exist, so catch...
      const stat = await fs.lstat(absPath)

      if (stat.isDirectory() && this.options.useIndexFile) {
        absPath += `${path.sep}${this.options.indexFile}`
        // Ensure the file system item exists
        await fs.lstat(absPath)
      }

      // Respond with a file
      await this.respondWithFilesystemItem(request, response, absPath)
    } catch (e) {
      await this.respondWithFileNotFound(request, response, absPath)
    }
  }

  protected async respondWithFilesystemItem(request: Request, response: Response, absPath: string): Promise<void> {
    await response.file(absPath)
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  protected async respondWithFileNotFound(request: Request, response: Response, absPath: string): Promise<void> {
    const message = isProduction() ? "File with name was not found" : `File with name was not found at ${absPath}`
    throw new HTTPException(Status.HTTP_404_NOT_FOUND, message)
  }

  protected mergePaths(filePath: string): string {
    // Simply join the strings. path.join would resolve ".." and you would be able to step out of the folder
    return `${this.folderPath}${path.normalize(filePath)}`
  }
}

export const staticRouter = (folderPath: string, options: Partial<StaticRouterProps> = {}): StaticRouter => {
  let stat: Stats
  try {
    folderPath = path.resolve(folderPath)
    stat = fsSync.lstatSync(folderPath)
  } catch (e) {
    throw new Error(`Could not access path "${folderPath}"`)
  }
  if (!stat.isDirectory()) {
    throw new Error(`Cannot serve static files from ${folderPath}. Path is not a directory`)
  }

  const mergedOptions = withDefaults<StaticRouterProps>(options, {
    followSymLinks: false,
    indexFile: "index.html",
    useIndexFile: false,
  })
  return new StaticRouter(folderPath, mergedOptions).pipe(
    staticContent(folderPath, { followSymlinks: mergedOptions.followSymLinks })
  )
}
