import { defaultServer, loggerMiddleware, LRequest, LResponse, NextFunction, RouterBase } from ".."
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { testClient, TestClient } from "@luftschloss/testing"
import SpyInstance = jest.SpyInstance

test("OnMount called", () => {
  const r1 = new RouterBase()
  const r2 = new RouterBase()
  r1.mount(r2, { basePath: "world" })

  defaultServer().mount(r1, { basePath: "hello" })
  const r3 = new RouterBase()
  expect(r3.isMounted()).toBe(false)
  r2.mount(r3)

  expect(r1.isMounted()).toBe(true)
  expect(r2.isMounted()).toBe(true)
  expect(r3.isMounted()).toBe(true)
  expect(r1.mountPath).toBe("/hello/")
  expect(r2.mountPath).toBe("/world/")
  expect(r3.mountPath).toBe("/")
  expect(r1.completePath).toBe("/hello/")
  expect(r2.completePath).toBe("/hello/world/")
  expect(r3.completePath).toBe("/hello/world/")
})

test("Regex mount option", () => {
  const r1 = new RouterBase()

  defaultServer().mount(r1, { basePath: "{:number}" })
  expect(r1.canHandle("/33/")).toBe(true)
  expect(r1.canHandle("33")).toBe(false)
  expect(r1.canHandle("/3d3/")).toBe(false)
})

test("Middleware added", () => {
  const middlewareStack = [
    {
      name: "custom-1",
      handle: async (next: NextFunction, req: LRequest, res: LResponse) => next(req, res),
      version: "0.0.0",
    },
    {
      name: "custom-2",
      handle: async (next: NextFunction, req: LRequest, res: LResponse) => next(req, res),
      version: "0.0.0",
    },
    {
      name: "custom-3",
      handle: async (next: NextFunction, req: LRequest, res: LResponse) => next(req, res),
      version: "0.0.0",
    },
  ]

  const r1 = new RouterBase().pipe(middlewareStack[1])
  const r2 = new RouterBase().pipe(middlewareStack[2])
  r1.mount(r2)
  const server = defaultServer().mount(r1)
  server.unPipeAll().pipe(middlewareStack[0])

  expect(r2.routerMiddlewares.length).toBe(1)
  expect(r2.routerMiddlewares[0].name).toBe("custom-3")

  expect(r2.middlewares).toEqual(middlewareStack)
  expect(r2.parentMiddlewares).toEqual(middlewareStack.slice(0, 2))
})

describe("Middleware execution order", () => {
  let client: TestClient = undefined!
  let consoleMock: SpyInstance = undefined!
  beforeEach(() => {
    consoleMock = jest.spyOn(console, "log").mockImplementationOnce(() => void 0)
    const server = defaultServer()
      .pipe({
        name: "custom-1",
        handle(next: NextFunction, req: LRequest, res: LResponse) {
          console.log(this.name)
          return next(req, res)
        },
        version: "0.0.0",
      })
      .unPipe(loggerMiddleware())
    const r1 = new RouterBase().pipe(
      {
        name: "custom-2",
        handle(next: NextFunction, req: LRequest, res: LResponse) {
          console.log(this.name)
          return next(req, res)
        },
        version: "0.0.0",
      },
      {
        name: "custom-3",
        handle(next: NextFunction, req: LRequest, res: LResponse) {
          console.log(this.name)
          return next(req, res)
        },
        version: "0.0.0",
      }
    )
    const r2 = new RouterBase().pipe({
      name: "custom-4",
      handle(next: NextFunction, req: LRequest, res: LResponse) {
        console.log(this.name)
        return next(req, res)
      },
      version: "0.0.0",
    })
    r2.routes.add("world", "GET", (req, res) => res.empty())
    r1.mount(r2, { basePath: "hello" })
    server.mount(r1)

    client = testClient(server, {
      url: {
        hostname: "127.0.0.1",
        port: 3000,
        protocol: "https",
      },
    })
  })

  afterEach(() => consoleMock.mockRestore())

  it("should execute middleware in correct order for registered routes", async () => {
    const response = await client.get("hello/world")
    expect(response.statusCode).toBe(204)
    expect((console.log as any).mock.calls).toEqual([["custom-1"], ["custom-2"], ["custom-3"], ["custom-4"]])
    expect(console.log).toHaveBeenCalledTimes(4)
  })

  it("should execute middleware in correct order for not found routes", async () => {
    const response = await client.get("does-not-exist")
    expect(response.statusCode).toBe(404)
    expect((console.log as any).mock.calls).toEqual([["custom-1"]])
    expect(console.log).toHaveBeenCalledTimes(1)
  })

  it("should execute middleware in correct order for wrong method", async () => {
    const response = await client.post("hello/world")
    expect(response.statusCode).toBe(405)
    expect((console.log as any).mock.calls).toEqual([["custom-1"], ["custom-2"], ["custom-3"], ["custom-4"]])
    expect(console.log).toHaveBeenCalledTimes(4)
  })

  it("should NOT execute the middlewares of the most detailed router", async () => {
    const response = await client.post("hello")
    expect(response.statusCode).toBe(404)
    expect((console.log as any).mock.calls).toEqual([["custom-1"]])
    expect(console.log).toHaveBeenCalledTimes(1)
  })
})

test("Test route resolving for router with regex mount path", async () => {
  const r1 = new RouterBase()
  r1.routes.add("hello", "GET", (req, res) => res.empty())

  const server = defaultServer().mount(r1, { basePath: "{:number}" })

  expect(r1.canHandle("/33/foo-bar")).toBe(true)
  const client = testClient(server, {
    url: {
      hostname: "127.0.0.1",
      port: 3000,
      protocol: "https",
    },
  })

  const response = await client.get("33/hello")
  expect(response.statusCode).toBe(204)
})
