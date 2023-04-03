import { luftServer, errorMiddleware, HTTPException, ServerImpl } from "..";
import { luftClient } from "@luftschloss/client";

describe("Default error handlers", () => {
  let server: ServerImpl;
  const client = luftClient();

  beforeAll(async () => {
    server = luftServer().unPipe("logger");
    server.get("/error", () => {
      throw new Error("This is an error");
    });
    server.get("/custom-error", () => {
      throw new HTTPException(400, "This is a custom error");
    });

    void server.listen(0);
    await server.onComplete("startupComplete");
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it("should use the default error handler for HTTP 500", async () => {
    const res = await client.get(`${server.address}/error`).send();
    const resBody = await res.json<any>();

    expect(res.status).toEqual(500);
    expect(resBody.error).toEqual("This is an error");
    expect(resBody.trace).toBeDefined();
    expect(Object.keys(resBody).length).toEqual(2);
  });

  it("should use the default error handler for HTTP 400", async () => {
    const res = await client.get(`${server.address}/custom-error`).send();
    const resBody = await res.json<any>();

    expect(res.status).toEqual(400);
    expect(resBody.error).toEqual("This is a custom error");
    expect(Object.keys(resBody).length).toEqual(1);
  });

  it("should use the default error handler for HTTP 404", async () => {
    const res = await client.get(`${server.address}/does-not-exist`).send();
    const resBody = await res.json<any>();

    expect(res.status).toEqual(404);
    expect(resBody.error).toEqual("Not Found");
    expect(Object.keys(resBody).length).toEqual(1);
  });

  it("should use the default error handler for HTTP 405", async () => {
    const res = await client.post(`${server.address}/custom-error`).send();
    const resBody = await res.json<any>();

    expect(res.status).toEqual(405);
    expect(resBody.error).toEqual("Method Not Allowed");
    expect(Object.keys(resBody).length).toEqual(1);
  });
});

describe("Custom error handlers", () => {
  let server: ServerImpl;
  const client = luftClient();

  beforeAll(async () => {
    server = luftServer()
      .unPipe("logger")
      .unPipe("error")
      .pipe(
        errorMiddleware({
          HTTP_404_NOT_FOUND: (error, request, response) => void response.text("Custom 404 - non-default").status(404),
          HTTP_405_METHOD_NOT_ALLOWED: (error, request, response) =>
            void response.text("Custom 405 - non-default").status(405),
          DEFAULT: (error, request, response) =>
            void response.text(`Custom ${error.status.message}`).status(error.status),
        })
      );
    server.get("/error", () => {
      throw new Error("This is an error for the custom error handler test");
    });
    server.get("/custom-error", () => {
      throw new HTTPException(400, "This is a custom error");
    });
    server.get("/unauthorized", () => {
      throw new HTTPException(401, Math.random().toString());
    });

    void server.listen(0);
    await server.onComplete("startupComplete");
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it("should use the custom error handler for HTTP 500", async () => {
    const res = await client.get(`${server.address}/error`).send();
    const resBody = await res.json<any>();

    expect(res.status).toEqual(500);
    expect(resBody.error).toEqual("This is an error for the custom error handler test");
    expect(resBody.trace).toBeDefined();
    expect(Object.keys(resBody).length).toEqual(2);
  });

  it("should use the custom error handler for HTTP 400", async () => {
    const res = await client.get(`${server.address}/custom-error`).send();
    const resBody = await res.text();

    expect(res.status).toEqual(400);
    expect(resBody).toEqual("Custom Bad Request");
  });

  it("should use the custom error handler for HTTP 404", async () => {
    const res = await client.get(`${server.address}/does-not-exist`).send();
    const resBody = await res.text();

    expect(res.status).toEqual(404);
    expect(resBody).toEqual("Custom 404 - non-default");
  });

  it("should use the custom error handler for HTTP 405", async () => {
    const res = await client.post(`${server.address}/custom-error`).send();
    const resBody = await res.text();

    expect(res.status).toEqual(405);
    expect(resBody).toEqual("Custom 405 - non-default");
  });

  it("should use the custom default error handler for HTTP 401", async () => {
    const res = await client.get(`${server.address}/unauthorized`).send();
    const resBody = await res.text();

    expect(res.status).toEqual(401);
    expect(resBody).toEqual("Custom Unauthorized");
  });
});
