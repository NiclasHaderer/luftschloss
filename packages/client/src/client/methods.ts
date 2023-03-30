import { ClientRequest } from "./client-request";
import { Headers } from "@luftschloss/common";
import { IncomingHttpHeaders } from "http";

export interface ClientOptions {
  followRedirects?: boolean;
  maxRedirects?: number;
  headers?: IncomingHttpHeaders | Headers;
}

export interface ClientOptionsWithBody extends ClientOptions {
  data?: string | Buffer | NodeJS.ReadableStream | URLSearchParams | object;
}

export const get = (url: string | URL, options: ClientOptions = {}): ClientRequest => {
  return request("GET", url, options);
};

export const head = (url: string | URL, options: ClientOptions = {}): ClientRequest => {
  return request("HEAD", url, options);
};

export const post = (url: string | URL, options: ClientOptionsWithBody = {}): ClientRequest => {
  return request("POST", url, options);
};
export const patch = (url: string | URL, options: ClientOptionsWithBody = {}): ClientRequest => {
  return request("PATCH", url, options);
};

export const options = (url: string | URL, options: ClientOptionsWithBody = {}): ClientRequest => {
  return request("OPTIONS", url, options);
};

export const put = (url: string | URL, options: ClientOptionsWithBody = {}): ClientRequest => {
  return request("PUT", url, options);
};

export const del = (url: string | URL, options: ClientOptionsWithBody = {}): ClientRequest => {
  return request("DELETE", url, options);
};

export const request = (method: string, url: string | URL, options: ClientOptionsWithBody = {}): ClientRequest => {
  if (options.data && (method === "GET" || method === "HEAD")) {
    throw new Error(`${method} requests cannot have a body`);
  }

  return new ClientRequest(url, method, {
    data: options.data,
    headers: options.headers ?? {},
    maxRedirects: options.followRedirects === false ? 0 : options.maxRedirects ?? 4,
  });
};
