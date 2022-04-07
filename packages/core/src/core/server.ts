import { defaultErrorHandler, ErrorHandler } from "./error-handler"
import { errorMiddleware, loggerMiddleware, noContentSniff, poweredBy, requestCompleter } from "../middleware"
import { DefaultRouter } from "../router"
import {
  intPathValidator,
  numberPathValidator,
  pathPathValidator,
  stringPathValidator,
  uuidPathValidator,
} from "../path-validator"
import { withServerBase } from "./server-base"
import { saveObject } from "./utils"

export type EventData = {
  data: Record<string, any>
}

class ServerImpl extends withServerBase(DefaultRouter) {}

export const defaultServer = (errorHandlers: Partial<ErrorHandler> = saveObject()): ServerImpl => {
  const server = new ServerImpl()
  server
    .pipe(loggerMiddleware())
    .pipe(requestCompleter())
    .pipe(errorMiddleware({ ...defaultErrorHandler, ...errorHandlers }))
    .pipe(noContentSniff())
    .pipe(poweredBy())

  server
    .addPathValidator(intPathValidator())
    .addPathValidator(numberPathValidator())
    .addPathValidator(pathPathValidator())
    .addPathValidator(stringPathValidator())
    .addPathValidator(uuidPathValidator())
  return server
}
