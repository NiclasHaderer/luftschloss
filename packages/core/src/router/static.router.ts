import { Router } from "./router"
import { BaseRouter } from "./base.router"
import { Request } from "../core/request"
import { Response } from "../core/response"
import * as fsSync from "fs"
import { promises as fs } from "fs"
import { HTTPException } from "../core/http-exception"
import { Status } from "../core/status"
import { fillWithDefaults } from "../core/utils"
import path from "path"

type StaticRouterProps = { followSymLinks: boolean }

class StaticRouter extends BaseRouter implements Router {
  constructor(private folderPath: string, private options: StaticRouterProps) {
    super()
    this._routeCollector.add("{path:path}", "GET", this.handlePath.bind(this))
  }

  protected async handlePath(request: Request<object, { path: string }>, response: Response): Promise<void> {
    // Get the file path and replace a leading / with noting (rootPath already has a leading /)
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
  // path.resolve has not trailing / at the end, so add it
  folderPath = `${path.resolve(folderPath)}${path.sep}`

  const stat = fsSync.lstatSync(folderPath)
  if (!stat.isDirectory()) {
    throw new Error(`Cannot serve static files from ${folderPath}. Path is not a directory`)
  }

  const mergedOptions = fillWithDefaults<StaticRouterProps>(options, { followSymLinks: false })
  return new StaticRouter(folderPath, mergedOptions)
}
