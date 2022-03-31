import { NextFunction } from "./middleware"
import { Request, Response, ResponseImpl } from "../core"

const RequestCompleterMiddleware = async (next: NextFunction, request: Request, response: Response) => {
  await next(request, response)
  if (!response.complete) {
    ;(response as ResponseImpl).end()
  }
}

export const requestCompleter = () => RequestCompleterMiddleware
