/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { apiServer } from "@luftschloss/openapi"
import { z } from "zod"

const params = z.object({
  size: z
    .string()
    .optional()
    .transform(() => 2),
  arr: z.array(z.string()).nullish(),
  q: z.string(),
})
const returnBody = z.object({
  q: z.string(),
  results: z.array(
    z.object({
      name: z.string(),
    })
  ),
})
const server = apiServer()
server.get("hello", { url: params, response: returnBody }).handle((url, body) => {
  return { q: "hello", results: [{ name: "hello" }] }
})
server.post("hello", { url: params, response: returnBody, body: returnBody }).handle((url, body) => {
  return { q: "", results: [] }
})

server.post("hello2", { url: params, response: returnBody, body: returnBody }).handle((queryParams, body) => {
  return { ...body, ...queryParams }
})

void server.listen()
