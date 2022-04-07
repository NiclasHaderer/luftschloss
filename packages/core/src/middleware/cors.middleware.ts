/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { ClassMiddlewareInterceptor, NextFunction } from "./middleware"
import { HTTP_METHODS, Request, Response, saveObject } from "../core"
import { withDefaults } from "../core"

type CorsMiddlewareOptions = {
  allowedMethods: HTTP_METHODS[] | "*"
  allowedHeaders: string[] | "*"
  allowCredentials: boolean
  exposeHeaders: string[]
  maxAge: number
} & (
  | {
      allowedOriginRegex?: RegExp
    }
  | {
      allowOrigins: string[] | "*"
    }
  | {
      allowOriginFunction: (request: Request) => boolean
    }
)

class CorsMiddleware implements ClassMiddlewareInterceptor {
  constructor(
    private defaultHeaders: Record<string, string[]>,
    private allowAllHeaders: boolean,
    private allowOriginRegex: RegExp | null,
    private allowOriginFunction: ((request: Request) => boolean) | null
  ) {}

  public async handle(next: NextFunction, request: Request, response: Response): Promise<void> {
    await next(request, response)

    if (request.method === "OPTIONS" && request.headers.has("access-control-request-method")) {
      this.preflightResponse(request, response)
      return
    }
  }

  private preflightResponse(request: Request, response: Response) {
    // Send back all headers if all headers should be allowed
    if (this.allowAllHeaders) {
      const requestedHeaders = request.headers.getAll("access-control-request-headers")
      requestedHeaders && response.headers.appendAll("Access-Control-Allow-Headers", requestedHeaders)
    }

    // Add all the default headers
    for (const [headerName, headerValue] of Object.entries(this.defaultHeaders)) {
      response.headers.appendAll(headerName, headerValue)
    }

    // Check if the regex or the allowOriginFunction are set and allow the request origin
    if (this.isAllowedOrigin(request)) {
      const requestedOrigin = request.headers.get("origin")
      requestedOrigin && response.headers.append("Access-Control-Allow-Origin", requestedOrigin)
    }
  }

  private isAllowedOrigin(request: Request): boolean {
    if (this.allowOriginRegex) {
      //eslint-disable-next-line @typescript-eslint/unbound-method
      const origin = request.headers.get("Origin")
      return !!(origin ?? this.allowOriginRegex.test(origin!))
    }

    if (this.allowOriginFunction) {
      return this.allowOriginFunction(request)
    }

    return false
  }
}

const getDefaultHeaders = (options: CorsMiddlewareOptions): Record<string, string[]> => {
  const headers = saveObject<Record<string, string[]>>()
  if ("allowOrigins" in options) {
    if (options.allowOrigins === "*") {
      headers["Access-Control-Allow-Origin"] = ["*"]
    } else {
      headers["Access-Control-Allow-Origin"] = options.allowOrigins
    }
  }

  if (options.allowedMethods === "*") {
    headers["Access-Control-Allow-Methods"] = ["*"]
  } else {
    headers["Access-Control-Allow-Methods"] = options.allowedMethods
  }

  if (Array.isArray(options.allowedHeaders)) {
    headers["Access-Control-Allow-Headers"] = options.allowedHeaders
  }

  headers["Access-Control-Allow-Credentials"] = [options.allowCredentials.toString()]
  headers["Access-Control-Max-Age"] = [options.maxAge.toString(10)]
  headers["Access-Control-Expose-Headers"] = options.exposeHeaders
  return headers
}

export const corsMiddleware = (options: Partial<CorsMiddlewareOptions>): ClassMiddlewareInterceptor => {
  const completeOptions = withDefaults(options, {
    allowOrigins: [],
    exposeHeaders: [],
    allowCredentials: false,
    allowedMethods: ["GET"],
    allowedHeaders: [],
    maxAge: 600,
  })
  const defaultHeaders = getDefaultHeaders(completeOptions)
  return new CorsMiddleware(
    defaultHeaders,
    !Array.isArray(completeOptions.allowedHeaders),
    "allowedOriginRegex" in options && options.allowedOriginRegex ? options.allowedOriginRegex : null,
    "allowOriginFunction" in options && options.allowOriginFunction ? options.allowOriginFunction : null
  )
}
