/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { saveObject, withDefaults } from "@luftschloss/common"
import { LRequest, LResponse, Router } from "@luftschloss/server"
import "./static.middleware"
import { staticContent } from "./static.middleware"
import { StaticRouter } from "./static.router"

type SPARouterProps = { indexFile: string }

class SPARouter extends StaticRouter implements Router {
  private readonly indexFile: string

  public constructor(folderPath: string, options: SPARouterProps) {
    super(folderPath, { ...options, useIndexFile: true })
    this.pipe(staticContent({ basePath: folderPath }))
    this.indexFile = options.indexFile
  }

  protected override async respondWithFileNotFound(
    request: LRequest,
    response: LResponse,
    absPath: string
  ): Promise<void> {
    await response.file(this.mergePaths(this.indexFile))
  }
}

export const spaRouter = (folderPath: string, options: Partial<SPARouterProps> = saveObject()): SPARouter => {
  const mergedOptions = withDefaults<SPARouterProps>({ indexFile: "index.html" }, options)
  return new SPARouter(folderPath, mergedOptions)
}
