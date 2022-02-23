import { NextFunction } from "./middleware"
import { RequestImpl } from "../core/request"
import { ResponseImpl } from "../core/response"

const RequestCompleterMiddleware = async (next: NextFunction, request: RequestImpl, response: ResponseImpl) => {
  await next(request, response)
  if (!response.complete) {
    // I don't want the user to complete the request. The request should be completed by this middleware
    ;(response as any).end()
  }
}

export const requestCompleter = () => RequestCompleterMiddleware
