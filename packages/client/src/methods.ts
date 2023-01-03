import { ClientRequest } from "./client-request"

export interface ClientOptions {
  followRedirects?: boolean
  maxRedirects?: number
}

export const get = (url: string, options: ClientOptions = {}): ClientRequest => {
  return request(url, "GET", options)
}

export const post = (url: string, options: ClientOptions = {}): ClientRequest => {
  return request(url, "POST", options)
}
export const patch = (url: string, options: ClientOptions = {}): ClientRequest => {
  return request(url, "PATCH", options)
}

export const head = (url: string, options: ClientOptions = {}): ClientRequest => {
  return request(url, "HEAD", options)
}

export const options = (url: string, options: ClientOptions = {}): ClientRequest => {
  return request(url, "OPTIONS", options)
}

export const put = (url: string, options: ClientOptions = {}): ClientRequest => {
  return request(url, "PUT", options)
}

export const del = (url: string, options: ClientOptions = {}): ClientRequest => {
  return request(url, "DELETE", options)
}

export const request = (url: string, method: string, options: ClientOptions = {}): ClientRequest => {
  const completeOptions = { followRedirects: true, maxRedirects: 4, ...options }
  return new ClientRequest(url, method, completeOptions)
}
