import { luftServer, ServerImpl } from "../core";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { testClient, TestClient } from "@luftschloss/testing";

describe("ContentSniffMiddleware default", () => {
  let server: ServerImpl;
  let client: TestClient;
  beforeAll(async () => {
    server = luftServer().unPipe("logger");
    client = await testClient(server);
  });
  afterAll(async () => await server.shutdown());

  it("should set the header", async () => {
    const response = await client.get("http://localhost:3000/");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("should set the header", async () => {
    const response = await client.post("http://localhost:3000/");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });
});

describe("ContentSniffMiddleware removed", () => {
  let server: ServerImpl;
  let client: TestClient;
  beforeAll(async () => {
    server = luftServer().unPipe("logger").unPipe("no-content-sniff");
    client = await testClient(server);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it("should not set the header", async () => {
    const response = await client.get("http://localhost:3000/");
    expect(response.headers["x-content-type-options"]).toBeUndefined();
  });

  it("should not set the header", async () => {
    const response = await client.post("http://localhost:3000/");
    expect(response.headers["x-content-type-options"]).toBeUndefined();
  });
});
