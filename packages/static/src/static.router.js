"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.staticRouter = void 0
const base_router_1 = require("@luftschloss/core/dist/router/base.router")
const fsSync = require("fs")
const fs_1 = require("fs")
const http_exception_1 = require("@luftschloss/core/dist/core/http-exception")
const status_1 = require("@luftschloss/core/dist/core/status")
const utils_1 = require("@luftschloss/core/dist/core/utils")
const path_1 = require("path")
class StaticRouter extends base_router_1.BaseRouter {
  constructor(folderPath, options) {
    super()
    this.folderPath = folderPath
    this.options = options
    this._routeCollector.add("{path:path}", "GET", this.handlePath.bind(this))
  }
  async handlePath(request, response) {
    // Get the file path and replace a leading / with noting (rootPath already has a leading /)
    let filePath = request.pathParams.path.replace(/^\//, "")
    // Normalize the file path
    filePath = path_1.default.normalize(filePath)
    try {
      const absPath = this.toAbsPath(filePath)
      const stat = await fs_1.promises.lstat(absPath)
      // Check if the file is a symbolic link and if symbolic links should be followed.
      if (!this.options.followSymLinks && stat.isSymbolicLink()) {
        // File is a symbolic link and symlinks should not be followed, so respond with a 404
        this.respondWithFileNotFound(request, response, filePath)
        return
      }
      await fs_1.promises.access(absPath)
    } catch (e) {
      this.respondWithFileNotFound(request, response, filePath)
    }
  }
  respondWithFile(request, response, absPath) {
    response.file(absPath)
  }
  respondWithFileNotFound(request, response, relPath) {
    throw new http_exception_1.HTTPException(status_1.Status.HTTP_404_NOT_FOUND, "File with name was not found")
  }
  toAbsPath(filePath) {
    // Simply join the strings. path.join would resolve ".." and you would be able to step out of the folder
    return `${this.folderPath}${filePath}`
  }
}
const staticRouter = (folderPath, options = {}) => {
  // path.resolve has not trailing / at the end, so add it
  folderPath = `${path_1.default.resolve(folderPath)}${path_1.default.sep}`
  const stat = fsSync.lstatSync(folderPath)
  if (!stat.isDirectory()) {
    throw new Error(`Cannot serve static files from ${folderPath}. Path is not a directory`)
  }
  const mergedOptions = (0, utils_1.fillWithDefaults)(options, { followSymLinks: false })
  return new StaticRouter(folderPath, mergedOptions)
}
exports.staticRouter = staticRouter
//# sourceMappingURL=static.router.js.map
