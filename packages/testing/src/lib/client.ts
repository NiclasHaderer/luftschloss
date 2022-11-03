/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import LightMyRequest, { DispatchFunc, inject, InjectOptions } from "light-my-request"
import { Options, OptionsWithBody, TestingClient } from "./types"
import { ServerBase } from "@luftschloss/server"

export const testClient = (server: ServerBase, ...args: Parameters<ServerBase["_testBootstrap"]>): TestingClient => {
  server._testBootstrap(...args)

  return {
    delete(
      url: string,
      options: OptionsWithBody = {},
      clientOptions?: InjectOptions | string
    ): Promise<LightMyRequest.Response> {
      return inject(server.handleIncomingRequest.bind(server) as unknown as DispatchFunc, clientOptions)
        .delete(url)
        .body(options.body || {})
        .query(options.query || {})
        .headers(options.headers || {})
        .cookies(options.cookies || {})
        .end()
    },
    get(url: string, options: Options = {}, clientOptions?: InjectOptions | string): Promise<LightMyRequest.Response> {
      return inject(server.handleIncomingRequest.bind(server) as unknown as DispatchFunc, clientOptions)
        .get("http://127.0.0.1:8080")
        .query(options.query || {})
        .headers(options.headers || {})
        .cookies(options.cookies || {})
        .end()
    },
    head(url: string, options: Options = {}, clientOptions?: InjectOptions | string): Promise<LightMyRequest.Response> {
      return inject(server.handleIncomingRequest.bind(server) as unknown as DispatchFunc, clientOptions)
        .head(url)
        .query(options.query || {})
        .headers(options.headers || {})
        .cookies(options.cookies || {})
        .end()
    },
    options(
      url: string,
      options: OptionsWithBody = {},
      clientOptions?: InjectOptions | string
    ): Promise<LightMyRequest.Response> {
      return inject(server.handleIncomingRequest.bind(server) as unknown as DispatchFunc, clientOptions)
        .options(url)
        .body(options.body || {})
        .query(options.query || {})
        .headers(options.headers || {})
        .cookies(options.cookies || {})
        .end()
    },
    patch(
      url: string,
      options: OptionsWithBody = {},
      clientOptions?: InjectOptions | string
    ): Promise<LightMyRequest.Response> {
      return inject(server.handleIncomingRequest.bind(server) as unknown as DispatchFunc, clientOptions)
        .patch(url)
        .body(options.body || {})
        .query(options.query || {})
        .headers(options.headers || {})
        .cookies(options.cookies || {})
        .end()
    },
    post(
      url: string,
      options: OptionsWithBody = {},
      clientOptions?: InjectOptions | string
    ): Promise<LightMyRequest.Response> {
      return inject(server.handleIncomingRequest.bind(server) as unknown as DispatchFunc, clientOptions)
        .post(url)
        .body(options.body || {})
        .query(options.query || {})
        .headers(options.headers || {})
        .cookies(options.cookies || {})
        .end()
    },
    trace(
      url: string,
      options: OptionsWithBody = {},
      clientOptions?: InjectOptions | string
    ): Promise<LightMyRequest.Response> {
      return inject(server.handleIncomingRequest.bind(server) as unknown as DispatchFunc, clientOptions)
        .trace(url)
        .body(options.body || {})
        .query(options.query || {})
        .headers(options.headers || {})
        .cookies(options.cookies || {})
        .end()
    },
  }
}
