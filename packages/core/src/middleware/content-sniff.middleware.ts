import { NextFunction } from "./middleware"
import { Request, Response } from "../core"

const ContentSniffMiddleware = async (next: NextFunction, request: Request, response: Response) => {
  await next(request, response)
  response.headers.append("X-Content-Type-Options", "nosniff")
}

export const noContentSniff = () => ContentSniffMiddleware
