import { defaultServer, loggerMiddleware, LRequest, LResponse, NextFunction, RouterBase } from ".."
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { testClient } from "@luftschloss/testing"

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

test("Middleware execution order", async () => {
  const consoleWarnMock = jest.spyOn(console, "log").mockImplementationOnce(() => void 0)

  const middlewareStack = [
    {
      name: "custom-1",
      handle(next: NextFunction, req: LRequest, res: LResponse) {
        console.log(this.name)
        return next(req, res)
      },
      version: "0.0.0",
    },
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
    },
    {
      name: "custom-4",
      handle(next: NextFunction, req: LRequest, res: LResponse) {
        console.log(this.name)
        return next(req, res)
      },
      version: "0.0.0",
    },
  ]
  const server = defaultServer().pipe(middlewareStack[0]).unPipe(loggerMiddleware())
  const r1 = new RouterBase().pipe(...middlewareStack.slice(1, 3))
  const r2 = new RouterBase().pipe(middlewareStack[3])
  r2.routes.add("hello", "GET", (req, res) => res.empty())
  r1.mount(r2)
  server.mount(r1)

  const client = testClient(server, {
    url: {
      hostname: "127.0.0.1",
      port: 3000,
      protocol: "https",
    },
  })
  const response = await client.get("hello")
  expect(response.statusCode).toBe(204)
  expect((console.log as any).mock.calls).toEqual([["custom-1"], ["custom-2"], ["custom-3"], ["custom-4"]])
  expect(console.log).toHaveBeenCalledTimes(4)
  consoleWarnMock.mockRestore()
  // TODO tests for wrong themod and 404
})

test("Test route resolving", () => {
  // TODO test for regex in mount path. This could lead to `canHandle` to return false
})
