import { apiServer } from "@luftschloss/openapi";
import { docsRouter, shortenerRouter } from "./app/routes";
import { corsMiddleware } from "@luftschloss/server";

const main = async () => {
  const server = apiServer();
  server.pipe(
    corsMiddleware({
      allowCredentials: true,
      allowedHeaders: "*",
      allowedMethods: "*",
      allowOriginFunction: () => true,
    })
  );
  server.mount(shortenerRouter(), { basePath: "/" });
  server.mount(docsRouter(), { basePath: "/docs" });
  void server.listen(3200, "0.0.0.0");
};
void main();
