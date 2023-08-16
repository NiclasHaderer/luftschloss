import { luftServer } from "@luftschloss/server";
import { proxyMiddleware } from "@luftschloss/proxy";
import * as path from "path";
import { staticRouter } from "@luftschloss/static";

const createServer = () => {
  const server = luftServer().pipe(proxyMiddleware());
  const staticDir = path.join(__dirname);

  console.log("staticDir", staticDir);
  const router = staticRouter(staticDir);
  server.mount(router);
  return server;
};

const main = async () => {
  const server = createServer();
  void server.listen(33333);
};

void main();
