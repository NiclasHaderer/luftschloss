/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import {
  DefaultErrorHandler,
  errorMiddleware,
  intPathValidator,
  loggerMiddleware,
  noContentSniff,
  numberPathValidator,
  pathPathValidator,
  poweredBy,
  requestCompleter,
  ServerBase,
  stringPathValidator,
  uuidPathValidator,
  withServerBase,
} from "@luftschloss/server";
import { ApiRouter } from "./api.router";

export class ApiServer extends withServerBase(ApiRouter) implements ServerBase {}

export const apiServer = ({ timeout = 5000, maxConnections = Number.MAX_SAFE_INTEGER } = {}) => {
  const server = new ApiServer();
  server.raw.setTimeout(timeout);
  server.raw.maxConnections = maxConnections;

  server
    .pipe(loggerMiddleware())
    .pipe(requestCompleter())
    .pipe(errorMiddleware({ ...DefaultErrorHandler }))
    .pipe(noContentSniff())
    .pipe(poweredBy());

  server
    .addPathValidator(intPathValidator())
    .addPathValidator(numberPathValidator())
    .addPathValidator(pathPathValidator())
    .addPathValidator(stringPathValidator())
    .addPathValidator(uuidPathValidator());

  return server;
};
