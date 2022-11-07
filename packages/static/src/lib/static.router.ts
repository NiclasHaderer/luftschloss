/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { withDefaults } from "@luftschloss/common"
import { HTTPException, isProduction, LRequest, LResponse, Router, RouterBase, Status } from "@luftschloss/server"
import { promises as fs } from "fs"
import path from "path"
import "./static.middleware"
import { staticContent } from "./static.middleware"

type StaticRouterProps = { useIndexFile: boolean; indexFile: string }

export class StaticRouter extends RouterBase implements Router {
  private readonly folderPath: string

  public constructor(folderPath: string, private options: StaticRouterProps) {
    super()
    this.pipe(
      staticContent({
        basePath: folderPath,
        allowOutsideBasePath: false,
      })
    )
    // path.resolve has not trailing / at the end, so add it
    this.folderPath = `${path.resolve(folderPath)}${path.sep}`
    // TODO HEAD response
    this.routeCollector.add("{path:path}", "GET", this.handlePath.bind(this))
    // TODO not modified response https://www.keycdn.com/support/304-not-modified
  }

  protected async handlePath(request: LRequest, response: LResponse): Promise<void> {
    // Get the file path and replace a leading / with noting (folderPath already has a / at the end)
    const filePath: string = request.pathParams<{ path: string }>().path.replace(/^\//, "")

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

  protected async respondWithFilesystemItem(request: LRequest, response: LResponse, absPath: string): Promise<void> {
    await response.file(absPath)
  }

  protected async respondWithFileNotFound(request: LRequest, response: LResponse, absPath: string): Promise<void> {
    const message = isProduction() ? "Requested file was not found" : `Requested file was not found at ${absPath}`
    throw new HTTPException(Status.HTTP_404_NOT_FOUND, message)
  }

  protected mergePaths(filePath: string): string {
    // Simply join the strings. path.join would resolve ".." and you would be able to step out of the folder
    return `${this.folderPath}${path.normalize(filePath)}`
  }
}

export const staticRouter = (folderPath: string, options: Partial<StaticRouterProps> = {}): StaticRouter => {
  const mergedOptions = withDefaults<StaticRouterProps>(
    {
      indexFile: "index.html",
      useIndexFile: false,
    },
    options
  )
  return new StaticRouter(folderPath, mergedOptions)
}
