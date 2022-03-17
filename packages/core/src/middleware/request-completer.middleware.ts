import { NextFunction } from "./middleware"
import { ResponseImpl } from "../core/response-impl"
import { Request } from "../core/request"
import { Response } from "../core/response"

const RequestCompleterMiddleware = async (next: NextFunction, request: Request, response: Response) => {
  await next(request, response)
  if (!response.complete) {
    ;(response as ResponseImpl).end()
  }
}

export const requestCompleter = () => RequestCompleterMiddleware
