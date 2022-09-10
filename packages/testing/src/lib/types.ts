/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import * as http from "http"
import { Response } from "light-my-request"

export interface Options {
  headers?: http.IncomingHttpHeaders | http.OutgoingHttpHeaders
  query?: Record<string, (string | number) | (string | number)[]>
  cookies?: Record<string, string>
}

export type OptionsWithBody = Options & { body?: Record<string, any> }

export interface TestingClient {
  get(url: string, options?: Options): Promise<Response>

  head(url: string, options?: Options): Promise<Response>

  post(url: string, options?: OptionsWithBody): Promise<Response>

  delete(url: string, options?: OptionsWithBody): Promise<Response>

  options(url: string, options?: OptionsWithBody): Promise<Response>

  trace(url: string, options?: OptionsWithBody): Promise<Response>

  patch(url: string, options?: OptionsWithBody): Promise<Response>
}
