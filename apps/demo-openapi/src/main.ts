import { apiServer, openApiRouter, redocRouter, stoplightRouter, swaggerRouter } from "@luftschloss/openapi";
import { apiDefinition } from "./app/api-definition";
import { shortenerRouter } from "./app/routes";
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
  server.mount(openApiRouter(apiDefinition));
  server.mount(stoplightRouter());
  server.mount(redocRouter());
  server.mount(swaggerRouter());
  void server.listen(3200, "0.0.0.0");
};
void main();
