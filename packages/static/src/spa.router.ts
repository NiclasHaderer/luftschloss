import { fillWithDefaults, Request, Response, Router } from "@luftschloss/core"
import * as fsSync from "fs"
import { Stats } from "fs"
import "./response"
import { StaticRouter } from "./static.router"

type SPARouterProps = { followSymLinks: boolean; indexFile: string }

class SPARouter extends StaticRouter implements Router {
  private readonly indexFile: string

  public constructor(folderPath: string, options: SPARouterProps) {
    super(folderPath, options)
    this.indexFile = options.indexFile
  }

  protected override respondWithFileNotFound(request: Request, response: Response, absPath: string): void {
    response.file(this.toAbsPath(this.indexFile))
  }
}

export const spaRouter = (folderPath: string, options: Partial<SPARouterProps> = {}): SPARouter => {
  let stat: Stats
  try {
    stat = fsSync.lstatSync(folderPath)
  } catch (e) {
    throw new Error(`Could not access path "${folderPath}"`)
  }
  if (!stat.isDirectory()) {
    throw new Error(`Cannot serve static files from ${folderPath}. Path is not a directory`)
  }

  const mergedOptions = fillWithDefaults<SPARouterProps>(options, { followSymLinks: false, indexFile: "index.html" })
  return new SPARouter(folderPath, mergedOptions)
}
