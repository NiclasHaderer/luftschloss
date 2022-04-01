import assert from "assert"
import {
  BaseRouter,
  fillWithDefaults,
  HTTPException,
  isProduction,
  Request,
  Response,
  Router,
  Status,
} from "@luftschloss/core"
import * as fsSync from "fs"
import { promises as fs, Stats } from "fs"
import "./response"
import path from "path"

type StaticRouterProps = { followSymLinks: boolean }

export class StaticRouter extends BaseRouter implements Router {
  private readonly folderPath: string

  public constructor(folderPath: string, private options: StaticRouterProps) {
    super()
    // path.resolve has not trailing / at the end, so add it
    this.folderPath = `${path.resolve(folderPath)}${path.sep}`
    this._routeCollector.add("{path:path}", "GET", this.handlePath.bind(this))
    // TODO HEAD response
    // TODO not modified response
  }

  protected async handlePath(request: Request<object, { path: string }>, response: Response): Promise<void> {
    // Get the file path and replace a leading / with noting (folderPath already has a / at the end)
    const filePath = request.pathParams.path.replace(/^\//, "")

    // Convert the file path to an absolute path
    const absPath = this.toAbsPath(path.normalize(filePath))

    // TODO if folder and folder has index.html respond with index.html or whatever the index file is

    try {
      // Throws if file does not exist, so catch...
      const stat = await fs.lstat(absPath)

      // Check if the file is a symbolic link and if symbolic links should be followed.
      assert.strictEqual(!this.options.followSymLinks && stat.isSymbolicLink(), false)

      // Respond with a file
      this.respondWithFile(request, response, absPath)
    } catch (e) {
      this.respondWithFileNotFound(request, response, absPath)
    }
  }

  protected respondWithFile(request: Request, response: Response, absPath: string): void {
    response.file(absPath)
  }

  protected respondWithFileNotFound(request: Request, response: Response, absPath: string): void {
    const message = isProduction() ? "File with name was not found" : `File with name was not found at ${absPath}`
    throw new HTTPException(Status.HTTP_404_NOT_FOUND, message)
  }

  protected toAbsPath(filePath: string): string {
    // Simply join the strings. path.join would resolve ".." and you would be able to step out of the folder
    return `${this.folderPath}${filePath}`
  }
}

export const staticRouter = (folderPath: string, options: Partial<StaticRouterProps> = {}): StaticRouter => {
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
