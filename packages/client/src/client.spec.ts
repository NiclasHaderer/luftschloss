import { Readable } from "node:stream";
import { defaultServer, ServerImpl, UTF8SearchParams } from "@luftschloss/server";
import { luftClient } from "./client";
import { bufferParser, formParser, jsonParser, textParser } from "@luftschloss/body";

const createServer = () => {
  const server = defaultServer().pipe(jsonParser("*"), formParser("*"), bufferParser("*"), textParser("*"));
  server.get("/json", (req, res) => res.json({ hello: "world" }));
  server.get("/text", (req, res) => res.text("hello world"));
  server.get("/redirect", (req, res) => res.redirect("http://127.0.0.1:33333/json", "307_TEMPORARY_REDIRECT"));
  server.get("/2-redirects", (req, res) => res.redirect("http://127.0.0.1:33333/redirect", "307_TEMPORARY_REDIRECT"));
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
    const buffer = await req.buffer().then(b => b.buffer);
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
    void server.listen(33333);
    await server.onComplete("start");
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it("should send a request and parse the json", async () => {
    const response = await client.get("http://127.0.0.1:33333/json").send();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ hello: "world" });
  });

  it("should send a request and parse the text", async () => {
    const response = await client.get("http://127.0.0.1:33333/text").send();
    expect(response.status).toBe(200);
    expect(await response.text()).toEqual("hello world");
  });

  it("should send a request and parse the buffer", async () => {
    const response = await client.get("http://127.0.0.1:33333/buffer").send();
    expect(response.status).toBe(200);
    expect(await response.buffer()).toEqual(Buffer.from("hello world"));
  });

  it("should send a request and follow redirects", async () => {
    const response = await client.get("http://127.0.0.1:33333/redirect").send();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ hello: "world" });
  });

  it("should send a request and follow external redirects", async () => {
    const response = await client.get("http://127.0.0.1:33333/redirect-external").send();
    expect(response.status).toBe(200);
    expect(response.url.toString()).toEqual("https://www.google.com/");
  });

  it("should send a request and not follow redirects using the redirect hook", async () => {
    const request = client.get("http://127.0.0.1:33333/redirect");
    request.on("redirect", event => event.preventRedirect());
    const response = await request.send();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toEqual("http://127.0.0.1:33333/json");
  });

  it("should send a request and not exceed the maximum number of redirects", async () => {
    const request = client.get("http://127.0.0.1:33333/2-redirects", { maxRedirects: 1 });
    request.on("redirect", event => event.preventRedirect());
    const response = await request.send();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toEqual("http://127.0.0.1:33333/redirect");
  });

  it("should send a request and not exceed the maximum number of redirects", async () => {
    const request = client.get("http://127.0.0.1:33333/2-redirects", { maxRedirects: 2 });
    const response = await request.send();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ hello: "world" });
  });

  it("should send a request and not follow redirects", async () => {
    const request = client.get("http://127.0.0.1:33333/redirect", { followRedirects: false });
    const response = await request.send();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toEqual("http://127.0.0.1:33333/json");
  });
});

describe("Test client with body", () => {
  const client = luftClient();
  let server: ServerImpl = undefined!;
  beforeAll(async () => {
    server = createServer();
    void server.listen(33333);
    await server.onComplete("start");
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it("should send a request and parse the json", async () => {
    const response = await client.post("http://127.0.0.1:33333/echo-json", { data: { hello: "world" } }).send();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ hello: "world" });
  });

  it("should send a request and parse the text", async () => {
    const response = await client.post("http://127.0.0.1:33333/echo-text", { data: "hello world" }).send();
    expect(await response.text()).toEqual("hello world");
    expect(response.status).toBe(200);
  });

  it("should send a request and parse the buffer", async () => {
    const response = await client
      .post("http://127.0.0.1:33333/echo-binary", { data: Buffer.from("hello world") })
      .send();
    expect(await response.buffer()).toEqual(Buffer.from("hello world"));
    expect(response.status).toBe(200);
  });

  it("should send a request and parse the stream", async () => {
    const stream = new Readable();
    stream.push("beep");
    stream.push(null);
    const response = await client
      .post("http://127.0.0.1:33333/echo-text", {
        data: stream,
      })
      .send();
    expect(await response.text()).toEqual("beep");
    expect(response.status).toBe(200);
  });

  it("should send a request and parse the form", async () => {
    const response = await client
      .post("http://127.0.0.1:33333/echo-form", {
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
