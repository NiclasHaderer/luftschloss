// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { luftServer, loggerMiddleware, ServerImpl, Status } from "@luftschloss/server";
import { luftClient } from "./client";

const createServer = () => {
  const server = luftServer().unPipe(loggerMiddleware());
  server.get("/ok", (req, res) => res.text("OK"));
  server.get("/redirect", (req, res) => res.redirect("http://localhost:33333/ok", Status.HTTP_307_TEMPORARY_REDIRECT));
  return server;
};

describe("Test consuming the body multiple times", () => {
  let server: ServerImpl = undefined!;
  const client = luftClient();

  beforeAll(async () => {
    server = createServer();
    void server.listen(0);
    await server.onComplete("startupComplete");
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it("should be able to consume the body multiple times", async () => {
    const response = await client.get(server.address).send();
    const body1 = await response.text("*/*");
    const body2 = await response.text("*/*");
    expect(body1).toEqual(body2);
  });

  it("should return the same buffer instance", async () => {
    const response = await client.get(server.address).send();
    const body1 = await response.buffer();
    const body2 = await response.buffer();
    expect(body1).toBe(body2);
  });
});

describe("Status code handling", () => {
  let server: ServerImpl = undefined!;
  const client = luftClient();

  beforeAll(async () => {
    server = createServer();
    void server.listen(0);
    await server.onComplete("startupComplete");
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it("should throw an error if the response is not ok", async () => {
    const response = await client.get(server.address).send();
    await expect(() => response.raiseForStatus()).toThrow(new Error(`HTTP Error 404: ${server.address}`));
  });

  it("should not an error if the response is ok", async () => {
    const response = await client.get(`${server.address}/ok`).send();
    await expect(() => response.raiseForStatus()).not.toThrow();
  });

  it("should not an error if the response is a redirect", async () => {
    const response = await client.get(`${server.address}/redirect`, { followRedirects: false }).send();
    await expect(() => response.raiseForStatus()).not.toThrow();
  });
});
