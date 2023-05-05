import { apiServer } from "@luftschloss/openapi";
import { docsRouter, shortenerRouter } from "./app/routes";
import { corsMiddleware } from "@luftschloss/server";
import { environment } from "./environments/environment";
const main = async () => {
  // Log whether the server is running in production mode or not
  console.log(`Running in ${environment.production ? "production" : "development"} mode`);

  const server = apiServer();
  server.pipe(
    corsMiddleware({
      allowCredentials: true,
      allowedHeaders: "ALL",
      allowedMethods: "ALL",
      allowOriginFunction: () => true,
    })
  );
  server.mount(shortenerRouter(), { basePath: "/" });
  server.mount(docsRouter(), { basePath: "/docs" });
  void server.listen(3200, "0.0.0.0");
};
void main();
