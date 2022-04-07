import { NextFunction } from "./middleware"
import { Request, Response } from "../core"

const PoweredByMiddleware = async (next: NextFunction, request: Request, response: Response) => {
  await next(request, response)
  response.headers.append("X-Powered-By", "luftschloss")
}

export const poweredBy = () => PoweredByMiddleware