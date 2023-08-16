/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { withDefaults } from "@luftschloss/common";
import { HTTPException, isProduction, LRequest, LResponse, Router, RouterBase, Status } from "@luftschloss/server";
import { promises as fs } from "fs";
import path from "path";
import "./static.middleware";
import { staticContent } from "./static.middleware";
import { Stats } from "node:fs";

type StaticRouterProps = { useIndexFile: boolean; indexFile: string };

export class StaticRouter extends RouterBase implements Router {
  private readonly folderPath: string;

  public constructor(folderPath: string, private options: StaticRouterProps) {
    super();
    this.pipe(
      staticContent({
        basePath: folderPath,
        allowOutsideBasePath: false,
      })
    );
    // path.resolve has not trailing "/" at the end, so add it
    this.folderPath = `${path.resolve(folderPath)}${path.sep}`;
    this.routeCollector.add("{path:path}", "GET", this.handlePath.bind(this));
    this.routeCollector.add("{path:path}", "HEAD", this.handleHead.bind(this));
    // TODO if nothing else has to be done: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match
  }

  protected async hasBeenModifiedSince(request: LRequest, absPath: string): Promise<boolean> {
    if (!request.headers.has("if-modified-since")) return true;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const notModifiedHeader = request.headers.get("If-Modified-Since")!;
    try {
      const notModifiedDate = new Date(notModifiedHeader);
      const fileDate = await fs.stat(absPath).then(stat => stat.mtime);
      return fileDate > notModifiedDate;
    } catch {
      return true;
    }
  }

  protected async handleHead(request: LRequest, response: LResponse): Promise<unknown> {
    const [exists, absPath, stats] = await this.getFilePath(request);
    if (!exists) return this.respondWithFileNotFound(request, response, absPath);

    if (!(await this.hasBeenModifiedSince(request, absPath))) {
      return response.status(Status.HTTP_304_NOT_MODIFIED).header("Content-Length", stats.size.toString());
    }

    response.empty().header("Content-Length", stats.size.toString());
  }

  protected async getFilePath(request: LRequest): Promise<[false, string, null] | [true, string, Stats]> {
    // Get the file path and replace a leading / with noting (folderPath already has a / at the end)
    const filePath = request.pathParams<{ path: string }>().path.replace(/^\//, "");
    // Convert the file path to an absolute path
    let absPath = this.mergePaths(filePath);

    // Throws if file does not exist, so catch...
    let stat: Stats;
    try {
      stat = await fs.lstat(absPath);
    } catch {
      return [false, absPath, null];
    }

    if (stat.isDirectory() && this.options.useIndexFile) {
      const newAbsPath = `${path.sep}${this.options.indexFile}`;
      // Ensure the file system item exists
      try {
        stat = await fs.lstat(newAbsPath);
        absPath = newAbsPath;
      } catch {
        return [false, absPath, null];
      }
    }
    return [true, absPath, stat];
  }

  protected async handlePath(request: LRequest, response: LResponse): Promise<unknown> {
    const [exists, absPath] = await this.getFilePath(request);

    // If the files have not been modified since the last request, respond with a 304
    if (!(await this.hasBeenModifiedSince(request, absPath))) {
      return response.status(Status.HTTP_304_NOT_MODIFIED);
    }

    if (exists) {
      await this.respondWithFilesystemItem(request, response, absPath);
    } else {
      await this.respondWithFileNotFound(request, response, absPath);
    }
  }

  protected async respondWithFilesystemItem(request: LRequest, response: LResponse, absPath: string): Promise<void> {
    await response.file(absPath);
  }

  protected async respondWithFileNotFound(request: LRequest, response: LResponse, absPath: string): Promise<void> {
    const message = isProduction() ? "Requested file was not found" : `Requested file was not found at ${absPath}`;
    throw new HTTPException(Status.HTTP_404_NOT_FOUND, message);
  }

  protected mergePaths(filePath: string): string {
    // Simply join the strings with path.join would resolve ".." and you would be able to step out of the folder
    return `${this.folderPath}${path.sep}${path.normalize(filePath)}`;
  }
}

export const staticRouter = (folderPath: string, options: Partial<StaticRouterProps> = {}): StaticRouter => {
  const mergedOptions = withDefaults<StaticRouterProps>(
    {
      indexFile: "index.html",
      useIndexFile: false,
    },
    options
  );
  return new StaticRouter(folderPath, mergedOptions);
};
