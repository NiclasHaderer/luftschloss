import { defaultServer, LRequest, LResponse, NextFunction, RouterBase } from ".."

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
  server.unPipe(...server.middlewares.map(m => m.name)).pipe(middlewareStack[0])

  expect(r2.routerMiddlewares.length).toBe(1)
  expect(r2.routerMiddlewares[0].name).toBe("custom-3")

  expect(r2.middlewares).toEqual(middlewareStack)
  expect(r2.parentMiddlewares).toEqual(middlewareStack.slice(0, 2))
})

// TODO check for middleware execution order
