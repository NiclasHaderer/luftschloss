import { defaultErrorHandler, ErrorHandler } from "./error-handler"
import { errorMiddleware, loggerMiddleware, requestCompleter } from "../middleware"
import { DefaultRouter } from "../router"
import {
  intPathValidator,
  numberPathValidator,
  pathPathValidator,
  stringPathValidator,
  uuidPathValidator,
} from "../path-validator"
import { withServerBase } from "./server-base"

export type EventData = {
  data: Record<string, any>
}

class ServerImpl extends withServerBase(DefaultRouter) {}

export const defaultServer = (errorHandlers: Partial<ErrorHandler> = {}): ServerImpl => {
  const server = new ServerImpl()
  server.pipe(loggerMiddleware(), requestCompleter(), errorMiddleware({ ...defaultErrorHandler, ...errorHandlers }))
  server
    .addPathValidator(intPathValidator())
    .addPathValidator(numberPathValidator())
    .addPathValidator(pathPathValidator())
    .addPathValidator(stringPathValidator())
    .addPathValidator(uuidPathValidator())
  return server
}
