import {
  addRequestField,
  HTTPException,
  LRequest,
  LResponse,
  Middleware,
  NextFunction,
  Status,
} from "@luftschloss/server";
import { luftClient } from "@luftschloss/client";

addRequestField<LRequest, "proxy">("proxy", {
  async value(url: string | URL) {
    throw new HTTPException(Status.HTTP_500_INTERNAL_SERVER_ERROR, "Use the proxy middleware to use this function");
  },
  writable: true,
});

const proxyMiddlewareWrapper = (options: object): Middleware => {
  const client = luftClient();

  return {
    name: "proxy",
    version: "1.0.0",
    handle: async (next: NextFunction, req: LRequest, res: LResponse) => {
      req.proxy = async () => {
        await client.request(req.method, req.url, {
          headers: req.headers,
          data: req.raw,
        });
      };
      await next(req, res);
    },
  };
};

export const proxyMiddleware = (options: object = {}) => {
  return proxyMiddlewareWrapper(options);
};
