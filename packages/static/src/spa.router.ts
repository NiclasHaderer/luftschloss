/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { Request, Response, Router, saveObject, withDefaults } from "@luftschloss/core"
import * as fsSync from "fs"
import { Stats } from "fs"
import "./static.middleware"
import { StaticRouter } from "./static.router"
import { staticContent } from "./static.middleware"

type SPARouterProps = { followSymLinks: boolean; indexFile: string }

class SPARouter extends StaticRouter implements Router {
  private readonly indexFile: string

  public constructor(folderPath: string, options: SPARouterProps) {
    super(folderPath, { ...options, useIndexFile: true })
    this.indexFile = options.indexFile
  }

  protected override async respondWithFileNotFound(
    request: Request,
    response: Response,
    absPath: string
  ): Promise<void> {
    await response.file(this.mergePaths(this.indexFile))
  }
}

export const spaRouter = (folderPath: string, options: Partial<SPARouterProps> = saveObject()): SPARouter => {
  let stat: Stats
  try {
    stat = fsSync.lstatSync(folderPath)
  } catch (e) {
    throw new Error(`Could not access path "${folderPath}"`)
  }
  if (!stat.isDirectory()) {
    throw new Error(`Cannot serve static files from ${folderPath}. Path is not a directory`)
  }

  const mergedOptions = withDefaults<SPARouterProps>(options, { followSymLinks: false, indexFile: "index.html" })
  return new SPARouter(folderPath, mergedOptions).pipe(
    staticContent(folderPath, { followSymlinks: mergedOptions.followSymLinks })
  )
}
