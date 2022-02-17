import { Request } from "./request"
import { Status } from "../impl/status"
import { HTTPException } from "../impl/http-exception"

type Handler = (error: HTTPException, request: Request) => void | Promise<void>

export type ErrorResponseHandler = Partial<{
  [STATUS in keyof typeof Status]: Handler
}> & { DEFAULT: Handler }
