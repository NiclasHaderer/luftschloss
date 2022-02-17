import { Request } from "./request"
import { Response } from "./response"

export type HTTP_METHODS = "GET" | "POST" | "DELETE" | "PUT" | "PATCH"
export const HTTP_METHODS: Record<HTTP_METHODS, HTTP_METHODS> = {
  DELETE: "DELETE",
  GET: "GET",
  PATCH: "PATCH",
  POST: "POST",
  PUT: "PUT",
}
export type ROUTE_HANDLER = (request: Request, response: Response) => Promise<any> | any
