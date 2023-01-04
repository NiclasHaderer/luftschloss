/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import LightMyRequest, { DispatchFunc, inject, InjectOptions } from "light-my-request";
import { Options, OptionsWithBody } from "./types";
import { ServerBase } from "@luftschloss/server";
import { DeepPartial, withDefaults } from "@luftschloss/common";

type GlobalOptions = Pick<InjectOptions, "simulate" | "authority" | "remoteAddress" | "validate" | "server"> & {
  url?: {
    pathname?: string;
    protocol?: string;
    hostname?: string;
    port?: string | number;
    query?: string | { [k: string]: string | string[] };
  };
};

type RequestOptions = Omit<DeepPartial<MergedGlobalOptions>, "url">;

type MergedGlobalOptions = Omit<GlobalOptions, "url"> & {
  url: InjectOptions["url"];
};

export const testClient = (server: ServerBase, globalClientOptions: GlobalOptions = {}) => {
  server._testBootstrap();

  return {
    delete(
      url: InjectOptions["url"],
      options: OptionsWithBody = {},
      clientOptions: RequestOptions = {}
    ): Promise<LightMyRequest.Response> {
      const mergedClientOptions = withDefaults<MergedGlobalOptions>({ ...globalClientOptions, url }, clientOptions);
      return inject(server.handleIncomingRequest.bind(server) as unknown as DispatchFunc, {
        ...mergedClientOptions,
        method: "delete",
        headers: options.headers,
        query: options.query,
        payload: options.body,
        cookies: options.cookies,
      }).end();
    },
    get(
      url: InjectOptions["url"],
      options: Options = {},
      clientOptions: RequestOptions = {}
    ): Promise<LightMyRequest.Response> {
      const mergedClientOptions = withDefaults<MergedGlobalOptions>({ ...globalClientOptions, url }, clientOptions);
      return inject(server.handleIncomingRequest.bind(server) as unknown as DispatchFunc, {
        ...mergedClientOptions,
        method: "get",
        headers: options.headers,
        query: options.query,
        cookies: options.cookies,
      }).end();
    },
    head(
      url: InjectOptions["url"],
      options: Options = {},
      clientOptions: RequestOptions = {}
    ): Promise<LightMyRequest.Response> {
      const mergedClientOptions = withDefaults<MergedGlobalOptions>({ ...globalClientOptions, url }, clientOptions);
      return inject(server.handleIncomingRequest.bind(server) as unknown as DispatchFunc, {
        ...mergedClientOptions,
        method: "head",
        headers: options.headers,
        query: options.query,
        cookies: options.cookies,
      }).end();
    },
    options(
      url: InjectOptions["url"],
      options: OptionsWithBody = {},
      clientOptions: RequestOptions = {}
    ): Promise<LightMyRequest.Response> {
      const mergedClientOptions = withDefaults<MergedGlobalOptions>({ ...globalClientOptions, url }, clientOptions);
      return inject(server.handleIncomingRequest.bind(server) as unknown as DispatchFunc, {
        ...mergedClientOptions,
        method: "options",
        headers: options.headers,
        query: options.query,
        payload: options.body,
        cookies: options.cookies,
      }).end();
    },
    patch(
      url: InjectOptions["url"],
      options: OptionsWithBody = {},
      clientOptions: RequestOptions = {}
    ): Promise<LightMyRequest.Response> {
      const mergedClientOptions = withDefaults<MergedGlobalOptions>({ ...globalClientOptions, url }, clientOptions);
      return inject(server.handleIncomingRequest.bind(server) as unknown as DispatchFunc, {
        ...mergedClientOptions,
        method: "patch",
        headers: options.headers,
        query: options.query,
        payload: options.body,
        cookies: options.cookies,
      }).end();
    },
    post(
      url: InjectOptions["url"],
      options: OptionsWithBody = {},
      clientOptions: RequestOptions = {}
    ): Promise<LightMyRequest.Response> {
      const mergedClientOptions = withDefaults<MergedGlobalOptions>({ ...globalClientOptions, url }, clientOptions);
      return inject(server.handleIncomingRequest.bind(server) as unknown as DispatchFunc, {
        ...mergedClientOptions,
        method: "post",
        headers: options.headers,
        query: options.query,
        payload: options.body,
        cookies: options.cookies,
      }).end();
    },
  };
};
