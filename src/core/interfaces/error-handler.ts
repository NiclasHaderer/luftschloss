import { Request } from "./request"
import { Status } from "../impl/status"
import { HTTPException } from "../impl/http-exception"
import { Response } from "./response"

type Handler = (error: HTTPException, request: Request, response: Response) => void | Promise<void>

export type ErrorHandler = Partial<{
  [STATUS in keyof typeof Status]: Handler
}> & { DEFAULT: Handler }
