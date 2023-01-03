import { defaultServer, ServerImpl } from "@luftschloss/server"
import { luftClient } from "./client"

const createServer = () => {
  const server = defaultServer()
  server.get("/json", (req, res) => res.json({ hello: "world" }))
  server.get("/text", (req, res) => res.text("hello world"))
  server.get("/redirect", (req, res) => res.redirect("http://127.0.0.1:33333/json", "307_TEMPORARY_REDIRECT"))
  server.get("/2-redirects", (req, res) => res.redirect("http://127.0.0.1:33333/redirect", "307_TEMPORARY_REDIRECT"))
  server.get("/redirect-external", (req, res) => res.redirect("https://google.com", "307_TEMPORARY_REDIRECT"))
  server.get("/buffer", (req, res) => res.buffer(Buffer.from("hello world")))
  server.get("/error/{statusCode:int}", (req, res) =>
    res
      .status(req.pathParams<{ statusCode: number }>().statusCode)
      .json({ error: req.pathParams<{ statusCode: number }>().statusCode })
  )

  return server
}

describe("Test client with simple get requests", () => {
  let server: ServerImpl = undefined!
  const client = luftClient()

  beforeAll(async () => {
    server = createServer()
    void server.listen(33333)
    await server.onComplete("start")
  })

  afterAll(async () => {
    await server.shutdown()
  })

  it("should send a request and parse the json", async () => {
    const response = await client.get("http://127.0.0.1:33333/json").send()
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ hello: "world" })
  })

  it("should send a request and parse the text", async () => {
    const response = await client.get("http://127.0.0.1:33333/text").send()
    expect(response.status).toBe(200)
    expect(await response.text()).toEqual("hello world")
  })

  it("should send a request and parse the buffer", async () => {
    const response = await client.get("http://127.0.0.1:33333/buffer").send()
    expect(response.status).toBe(200)
    expect(await response.buffer()).toEqual(Buffer.from("hello world"))
  })

  it("should send a request and follow redirects", async () => {
    const response = await client.get("http://127.0.0.1:33333/redirect").send()
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ hello: "world" })
  })

  it("should send a request and follow external redirects", async () => {
    const response = await client.get("http://127.0.0.1:33333/redirect-external").send()
    expect(response.status).toBe(200)
    expect(response.url.toString()).toEqual("https://www.google.com/")
  })

  it("should send a request and not follow redirects using the redirect hook", async () => {
    const request = client.get("http://127.0.0.1:33333/redirect")
    request.on("redirect", event => event.preventRedirect())
    const response = await request.send()

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toEqual("http://127.0.0.1:33333/json")
  })

  it("should send a request and not exceed the maximum number of redirects", async () => {
    const request = client.get("http://127.0.0.1:33333/2-redirects", { maxRedirects: 1 })
    request.on("redirect", event => event.preventRedirect())
    const response = await request.send()

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toEqual("http://127.0.0.1:33333/redirect")
  })

  it("should send a request and not exceed the maximum number of redirects", async () => {
    const request = client.get("http://127.0.0.1:33333/2-redirects", { maxRedirects: 2 })
    const response = await request.send()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ hello: "world" })
  })

  it("should send a request and not follow redirects", async () => {
    const request = client.get("http://127.0.0.1:33333/redirect", { followRedirects: false })
    const response = await request.send()

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toEqual("http://127.0.0.1:33333/json")
  })
})

describe("test invalid configuration", () => {
  const client = luftClient()

  it("should throw an error for using the wrong protocol", async () => {
    expect(() => {
      client.get("hello://someurl.uri", { followRedirects: false })
    }).toThrow(Error(`Protocol hello: is not in the supported http:,https:`))
  })
})
