import { Readable } from "node:stream";
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { luftServer, loggerMiddleware, ServerImpl } from "@luftschloss/server";
import { luftClient } from "./client";
import { UTF8SearchParams } from "@luftschloss/common";

const createServer = () => {
  const server = luftServer().unPipe(loggerMiddleware());
  server.get("/json", (req, res) => res.json({ hello: "world" }));
  server.get("/text", (req, res) => res.text("hello world"));
  server.get("/redirect", (req, res) => res.redirect(`${server.address}/json`, "307_TEMPORARY_REDIRECT"));
  server.get("/2-redirects", (req, res) => res.redirect(`${server.address}/redirect`, "307_TEMPORARY_REDIRECT"));
  server.get("/redirect-external", (req, res) => res.redirect("https://google.com", "307_TEMPORARY_REDIRECT"));
  server.get("/buffer", (req, res) => res.buffer(Buffer.from("hello world")));
  server.get("/error/{statusCode:int}", (req, res) =>
    res
      .status(req.pathParams<{ statusCode: number }>().statusCode)
      .json({ error: req.pathParams<{ statusCode: number }>().statusCode })
  );
  server.post("/echo-json", async (req, res) => res.json(await req.json()));
  server.post("/echo-text", async (req, res) => {
    const text = await req.text();
    res.text(text);
  });
  server.post("/echo-binary", async (req, res) => {
    const buffer = await req.buffer();
    res.buffer(buffer);
  });
  server.post("/echo-form", async (req, res) => {
    const form = await req.form();
    res.form(form);
  });

  return server;
};

describe("Test client with simple get requests", () => {
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

  it("should send a request and parse the json", async () => {
    const response = await client.get(`${server.address}/json`).send();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ hello: "world" });
  });

  it("should send a request and parse the text", async () => {
    const response = await client.get(`${server.address}/text`).send();
    expect(response.status).toBe(200);
    expect(await response.text()).toEqual("hello world");
  });

  it("should send a request and parse the buffer", async () => {
    const response = await client.get(`${server.address}/buffer`).send();
    expect(response.status).toBe(200);
    expect(await response.buffer()).toEqual(Buffer.from("hello world"));
  });

  it("should send a request and follow redirects", async () => {
    const response = await client.get(`${server.address}/redirect`).send();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ hello: "world" });
  });

  it("should send a request and follow external redirects", async () => {
    const response = await client.get(`${server.address}/redirect-external`).send();
    expect(response.status).toBe(200);
    expect(response.url.toString()).toEqual("https://www.google.com/");
    response.destroy();
  });

  it("should send a request and not follow redirects using the redirect hook", async () => {
    const request = client.get(`${server.address}/redirect`);
    request.on("redirect", event => event.preventRedirect());
    const response = await request.send();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toEqual(`${server.address}/json`);
  });

  it("should send a request and not exceed the maximum number of redirects", async () => {
    const request = client.get(`${server.address}/2-redirects`, { maxRedirects: 1 });
    request.on("redirect", event => event.preventRedirect());
    const response = await request.send();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toEqual(`${server.address}/redirect`);
  });

  it("should send a request and not exceed the maximum number of redirects", async () => {
    const request = client.get(`${server.address}/2-redirects`, { maxRedirects: 2 });
    const response = await request.send();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ hello: "world" });
    expect(response.history.length).toBe(2);
    expect(response.history[0].url).toStrictEqual(new URL(`${server.address}/2-redirects`));
    expect(await response.history[0].text("*/*")).toStrictEqual("");
    expect(response.history[1].url).toStrictEqual(new URL(`${server.address}/redirect`));
    expect(await response.history[1].text("*/*")).toStrictEqual("");
  });

  it("should send a request and not follow redirects", async () => {
    const request = client.get(`${server.address}/redirect`, { followRedirects: false });
    const response = await request.send();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toEqual(`${server.address}/json`);
  });
});

describe("Test client with body", () => {
  const client = luftClient();
  let server: ServerImpl = undefined!;
  beforeAll(async () => {
    server = createServer();
    void server.listen(0);
    await server.onComplete("startupComplete");
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterAll(async () => await server.shutdown());

  it("should send a request and parse the json", async () => {
    const response = await client.post(`${server.address}/echo-json`, { data: { hello: "world" } }).send();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ hello: "world" });
  });

  it("should send a request and parse the text", async () => {
    const response = await client.post(`${server.address}/echo-text`, { data: "hello world" }).send();
    expect(await response.text()).toEqual("hello world");
    expect(response.status).toBe(200);
  });

  it("should send a request and parse the buffer", async () => {
    const response = await client.post(`${server.address}/echo-binary`, { data: Buffer.from("hello world") }).send();
    expect(await response.buffer()).toEqual(Buffer.from("hello world"));
    expect(response.status).toBe(200);
  });

  it("should send a request and parse the stream", async () => {
    const stream = new Readable();
    stream.push("beep");
    stream.push(null);
    const response = await client
      .post(`${server.address}/echo-text`, {
        data: stream,
        headers: {
          "content-type": "text/plain",
        },
      })
      .send();
    expect(await response.text()).toEqual("beep");
    expect(response.status).toBe(200);
  });

  it("should send a request and parse the form", async () => {
    const response = await client
      .post(`${server.address}/echo-form`, {
        data: new UTF8SearchParams({
          hello: "world-äöüß",
        }),
      })
      .send();
    expect(await response.form()).toEqual(
      new UTF8SearchParams({
        hello: "world-äöüß",
      })
    );
    expect(response.status).toBe(200);
  });
});

describe("test invalid configuration", () => {
  const client = luftClient();

  it("should throw an error for using the wrong protocol", async () => {
    expect(() => {
      client.get("hello://someurl.uri", { followRedirects: false });
    }).toThrow(Error(`Protocol hello: is not in the supported http:,https:`));
  });

  it("should throw an error for trying to send the wrong data type", async () => {
    try {
      // For some reason expect to throw does not work
      await client.post("http://127.0.0.1:33333/echo-json", { data: 123 as any }).send();
      expect("function did not throw").toBe(false);
    } catch (e) {
      expect(e).toBe(
        `Unsupported data type: int. Accepted data types are: string, Buffer, URLSearchParams, Stream, object`
      );
    }
  });

  it("should throw an error if data is passed to head or get", async () => {
    expect(() => {
      client.request("GET", "http://127.0.0.1:33333", { data: "hello" });
    }).toThrow("GET requests cannot have a body");
    expect(() => {
      client.request("HEAD", "http://127.0.0.1:33333", { data: "hello" });
    }).toThrow("HEAD requests cannot have a body");
  });
});
