import { apiServer } from "@luftschloss/openapi";
import { authenticateRouter } from "./app/routes/api";
import { generateKey } from "./app/plattform/key";

const main = async () => {
  const server = apiServer();
  server.mount(authenticateRouter(), { basePath: "/" });
  await generateKey();
  void server.listen(3200, "0.0.0.0");
};
void main();
