import {defaultServer} from "@luftschloss/server";
import {luftClient} from "@luftschloss/client";
import {proxyMiddleware} from "@luftschloss/proxy";

const createServer = () => {
  const server = defaultServer().pipe(proxyMiddleware());

  server.get("/text", async (req, res) => {
    return res.text("Hello World");
  });
  server.post("/text", async (req, res) => {
    return res.text(await req.text());
  });

  server.get("/proxy-text", async (req) => {
    await req.proxy("http://127.0.0.1:33333/text");
  });
  server.post("/proxy-text", async (req) => {
    await req.proxy("http://127.0.0.1:33333/text");
  });

  return server;
};

const main = async () => {
  const client = luftClient();
  const server = createServer();
  void server.listen(33333);
  await server.onComplete("startupComplete");

  const response = await client.post("http://127.0.0.1:33333/text", {data: "some-text"}).send();
  console.log(response.status);
  console.log(await response.text());
  await server.shutdown();
};
void main();
