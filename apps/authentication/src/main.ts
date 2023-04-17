import { apiServer } from "@luftschloss/openapi";

const main = async () => {
  const server = apiServer();

  void server.listen(3200, "0.0.0.0");
};

void main();
