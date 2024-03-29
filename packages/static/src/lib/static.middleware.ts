/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { HTTPException, LRequest, LResponse, Middleware, NextFunction, Status } from "@luftschloss/server";
import * as fs from "node:fs";
import { Stats } from "node:fs";
import * as path from "node:path";
import { addRangeResponseHeaders, getRange } from "./content-range";
import { getMimeType } from "./lookup-mime";

export type StaticContentOptions =
  | {
      basePath: string;
      allowOutsideBasePath?: false;
    }
  | {
      allowOutsideBasePath: true;
    };

type InternalStaticContentOptions = StaticContentOptions & {
  pathNotFound: (request: LRequest, response: LResponse, absPath: string) => LResponse | Promise<LResponse>;
};

const staticContentMiddleware = (options: InternalStaticContentOptions): Middleware => {
  return {
    name: "static-content",
    version: "1.0.0",
    handle: async (next: NextFunction, request, response) => {
      response.file = async (filePath: string): Promise<LResponse> => {
        // If you allow a path outside the base path, we resolve the path to an absolute path
        if (options.allowOutsideBasePath) {
          filePath = path.resolve(filePath);
        }
        // The path is already absolute and inside the base path, therefore, we just use it
        else if (filePath.startsWith(`${options.basePath}${path.sep}`)) {
          // Do nothing
        } else {
          filePath = `${options.basePath}${path.sep}${filePath}`;
        }

        let stat: Stats;
        try {
          stat = await fs.promises.lstat(filePath);
        } catch (e) {
          await options.pathNotFound(request, response, filePath);
          return response;
        }

        // Get and append mimetype
        const mime = getMimeType(filePath);
        if (mime) response.headers.append("Content-Type", mime);

        // Get content ranges
        const contentRanges = getRange(request, response, stat);

        // If the response is a partial response add the right status code
        if (contentRanges.partial) response.status(Status.HTTP_206_PARTIAL_CONTENT);

        // Add the response range headers
        addRangeResponseHeaders(request, response, contentRanges, stat);

        // Extract the requested byte ranges from the file
        const streams = contentRanges.parts.map(range =>
          fs.createReadStream(filePath, {
            start: range.start,
            end: range.end,
          })
        );

        return response.stream(streams);
      };

      await next(request, response);
    },
  };
};

export const staticContent = (
  { ...options }: StaticContentOptions,
  pathNotFound?: (request: LRequest, response: LResponse, absPath: string) => LResponse | Promise<LResponse>
): Middleware => {
  if (!options.allowOutsideBasePath) {
    options.basePath = path.resolve(options.basePath);
    const stat = fs.lstatSync(options.basePath);
    if (!stat.isDirectory()) {
      throw new Error(`Cannot serve static files from ${options.basePath}. Path is not a directory`);
    }
  }

  return staticContentMiddleware({
    ...options,
    pathNotFound:
      pathNotFound ??
      ((_, __, filePath) => {
        throw new HTTPException(Status.HTTP_500_INTERNAL_SERVER_ERROR, `File ${filePath} was not found.`);
      }),
  });
};
