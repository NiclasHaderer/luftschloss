import { LRequest, LResponse, ResponseImpl } from "../core";
import { Middleware, NextFunction } from "./middleware";

const RequestCompleter: Middleware = {
  name: "request-complete",
  version: "1.0.0",
  handle: async (next: NextFunction, request: LRequest, response: LResponse) => {
    if (!(response instanceof ResponseImpl)) {
      console.warn(
        `Response is not an instance of ResponseImpl. Cannot complete request. Remove the ${RequestCompleter.name}`
      );
      return next(request, response);
    }
    await next(request, response);
    await response.end();
  },
};

export const requestCompleter = (): Middleware => RequestCompleter;
