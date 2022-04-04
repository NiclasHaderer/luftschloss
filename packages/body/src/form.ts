import { JsonParserOptions } from "./json"
import { HttpMiddlewareInterceptor } from "@luftschloss/core"

export const formParser = (
  contentType = ["application/json"],
  options: Partial<JsonParserOptions>
): HttpMiddlewareInterceptor => {
  return async (next, req, res) => {
    // TODO
    await next(req, res)
  }
}
