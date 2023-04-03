/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { errorMiddleware, loggerMiddleware, noContentSniff, poweredBy, requestCompleter } from "../middleware";
import {
  intPathValidator,
  numberPathValidator,
  pathPathValidator,
  stringPathValidator,
  uuidPathValidator,
} from "../path-validator";
import { DefaultRouter } from "../router";
import { DefaultErrorHandler } from "./error-handler";
import { withServerBase } from "./server-base";

export class ServerImpl extends withServerBase(DefaultRouter) {}

export const luftServer = ({ timeout = 5000, maxConnections = Number.MAX_SAFE_INTEGER } = {}): ServerImpl => {
  const server = new ServerImpl();
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
