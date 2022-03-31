import { BaseRouter, fillWithDefaults, HTTPException, Request, Response, Router, Status } from "@luftschloss/core"
import * as fsSync from "fs"
import { promises as fs, Stats } from "fs"
import "./response"
import path from "path"

type StaticRouterProps = { followSymLinks: boolean }

class StaticRouter extends BaseRouter implements Router {
  private readonly folderPath: string

  constructor(folderPath: string, private options: StaticRouterProps) {
    super()
    // path.resolve has not trailing / at the end, so add it
    this.folderPath = `${path.resolve(folderPath)}${path.sep}`
    this._routeCollector.add("{path:path}", "GET", this.handlePath.bind(this))
  }

  protected async handlePath(request: Request<object, { path: string }>, response: Response): Promise<void> {
    // Get the file path and replace a leading / with noting (folderPath already has a leading /)
    let filePath = request.pathParams.path.replace(/^\//, "")

    // Normalize the file path
    filePath = path.normalize(filePath)
    try {
      const absPath = this.toAbsPath(filePath)
      const stat = await fs.lstat(absPath)

      // Check if the file is a symbolic link and if symbolic links should be followed.
      if (!this.options.followSymLinks && stat.isSymbolicLink()) {
        // File is a symbolic link and symlinks should not be followed, so respond with a 404
        this.respondWithFileNotFound(request, response, filePath)
        return
      }

      await fs.access(absPath)
    } catch (e) {
      this.respondWithFileNotFound(request, response, filePath)
    }
  }

  protected respondWithFile(request: Request, response: Response, absPath: string): void {
    response.file(absPath)
  }

  protected respondWithFileNotFound(request: Request, response: Response, relPath: string): void {
    throw new HTTPException(Status.HTTP_404_NOT_FOUND, "File with name was not found")
  }

  private toAbsPath(filePath: string): string {
    // Simply join the strings. path.join would resolve ".." and you would be able to step out of the folder
    return `${this.folderPath}${filePath}`
  }
}

export const staticRouter = (folderPath: string, options: Partial<StaticRouterProps> = {}) => {
  let stat: Stats
  try {
    stat = fsSync.lstatSync(folderPath)
  } catch (e) {
    throw new Error(`Could not access path "${folderPath}"`)
  }
  if (!stat.isDirectory()) {
    throw new Error(`Cannot serve static files from ${folderPath}. Path is not a directory`)
  }

  const mergedOptions = fillWithDefaults<StaticRouterProps>(options, { followSymLinks: false })
  return new StaticRouter(folderPath, mergedOptions)
}
