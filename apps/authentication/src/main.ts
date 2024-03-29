import { KeyPairHolder } from "./app/plattform/key";
import { apiServer } from "@luftschloss/openapi";
import { corsMiddleware } from "@luftschloss/server";
import { authenticateRouter, docsRouter } from "./app/routes";

const main = async () => {
  await new KeyPairHolder().init();

  const server = apiServer();
  server.pipe(
    corsMiddleware({
      allowCredentials: true,
      allowedHeaders: "ALL",
      allowedMethods: "ALL",
      allowOriginFunction: () => true,
    })
  );
  server.mount(authenticateRouter(), { basePath: "/" });
  server.mount(docsRouter(), { basePath: "/docs" });
  void server.listen(3300, "0.0.0.0");
};
void main();
