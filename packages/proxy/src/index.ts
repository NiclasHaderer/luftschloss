import "@luftschloss/server";

export { proxyMiddleware } from "./proxy";

declare module "@luftschloss/server" {
  interface LRequest {
    proxy(url: string | URL): Promise<void>;
  }

  interface RequestImpl {
    proxy(url: string | URL): Promise<void>;
  }
}
