import { defaultServer } from "../core"
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { testClient } from "@luftschloss/testing"
import { corsMiddleware } from "./cors.middleware"
import { Middleware } from "./middleware"
import { OutgoingHttpHeaders } from "http"

const getClient = (...middlewares: Middleware[]) => {
  const server = defaultServer().pipe(...middlewares)
  return testClient(server)
}

const dropIrrelevantHeaders = (headers: OutgoingHttpHeaders) => {
  delete headers["content-length"]
  delete headers["content-type"]
  delete headers["transfer-encoding"]
  delete headers["date"]
  delete headers["connection"]
  delete headers["x-powered-by"]
  return headers
}

test("CORS: should return no cors headers", async () => {
  const client = getClient(corsMiddleware())
  const headers = await client.get("", {}).then(r => dropIrrelevantHeaders(r.headers))
  expect(headers).toStrictEqual({})
})

test("CORS: should return cors wildcard", async () => {
  const client = getClient(corsMiddleware())

  const headers = await client
    .get("", {
      headers: {
        Origin: "http://google.com",
      },
    })
    .then(r => dropIrrelevantHeaders(r.headers))

  expect(headers).toStrictEqual({
    "access-control-allow-credentials": "false",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "*",
    "access-control-allow-origin": "*",
    "access-control-max-age": "600",
  })
})
