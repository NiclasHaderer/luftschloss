/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import {errorMiddleware, loggerMiddleware, noContentSniff, poweredBy} from "../middleware"
import {
  intPathValidator,
  numberPathValidator,
  pathPathValidator,
  stringPathValidator,
  uuidPathValidator,
} from "../path-validator"
import {DefaultRouter} from "../router"
import {DefaultErrorHandler} from "./error-handler"
import {ServerBase, withServerBase} from "./server-base"

class ServerImpl extends withServerBase(DefaultRouter) {
}

export const defaultServer = ({timeout = 5000, maxConnections = Infinity} = {}): ServerBase & DefaultRouter => {
  const server = new ServerImpl()


  server.raw.setTimeout(timeout)
  server.raw.maxConnections = maxConnections
  server
    .pipe(loggerMiddleware())
    .pipe(errorMiddleware({...DefaultErrorHandler}))
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
