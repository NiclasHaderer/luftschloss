/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import * as http from "http";
import type { testClient } from "./client";

export interface Options {
  headers?: http.IncomingHttpHeaders | http.OutgoingHttpHeaders;
  query?: Record<string, string | string[]>;
  cookies?: Record<string, string>;
}

export type OptionsWithBody = Options & { body?: Record<string, any> };

export type TestClient = ReturnType<typeof testClient>;
