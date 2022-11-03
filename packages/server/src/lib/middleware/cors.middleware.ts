/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { saveObject, withDefaults } from "@luftschloss/common"
import { HTTP_METHODS, LRequest, LResponse } from "../core"
import { Middleware, NextFunction } from "./middleware"

type CorsMiddlewareOptions = {
  allowedMethods: HTTP_METHODS[] | "*" | "ALL"
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
      allowOriginFunction: (request: LRequest) => boolean
    }
)

// TODO fix this
class CorsMiddleware implements Middleware {
  public readonly name = "cors"
  public readonly version = "1.0.0"

  public constructor(
    private defaultHeaders: Record<string, string[]>,
    private allowAllHeaders: boolean,
    private allowOriginRegex: RegExp | null,
    private allowOriginFunction: ((request: LRequest) => boolean) | null
  ) {}

  public async handle(next: NextFunction, request: LRequest, response: LResponse): Promise<void> {
    if (this.isPreflightRequest(request)) {
      this.preflightResponse(request, response)
    } else if (request.headers.has("Origin")) {
      this.simpleResponse(request, response)
    }
    await next(request, response)
  }

  private isPreflightRequest(request: LRequest): boolean {
    return request.method === "OPTIONS" && request.headers.has("Access-Control-Request-Method")
  }

  private preflightResponse(request: LRequest, response: LResponse) {
    // Send back all headers if all headers should be allowed
    if (this.allowAllHeaders) {
      const requestedHeaders = request.headers.getAll("Access-Control-Request-Headers")
      requestedHeaders && response.headers.appendAll("Access-Control-Allow-Headers", requestedHeaders)
    }

    // Add all the default headers
    response.headers.mergeIn(this.defaultHeaders)

    // Check if the regex or the allowOriginFunction are set and allow the request origin
    if (this.isInDynamicOrigin(request)) {
      const requestedOrigin = request.headers.get("origin")
      requestedOrigin && response.headers.append("Access-Control-Allow-Origin", requestedOrigin)
    }
  }

  private simpleResponse(request: LRequest, response: LResponse) {
    if (this.isInDynamicOrigin(request)) {
      const requestedOrigin = request.headers.get("origin")!
      response.headers.append("Access-Control-Allow-Origin", requestedOrigin)
    }
    response.headers.mergeIn(this.defaultHeaders)
  }

  private isInDynamicOrigin(request: LRequest): boolean {
    if (this.allowOriginRegex) {
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
  } else if (options.allowedMethods === "ALL") {
    headers["Access-Control-Allow-Methods"] = Object.values(HTTP_METHODS)
  } else {
    headers["Access-Control-Allow-Methods"] = options.allowedMethods
  }

  if (Array.isArray(options.allowedHeaders)) {
    headers["Access-Control-Allow-Headers"] = options.allowedHeaders
  } else if (options.allowedHeaders === "*") {
    headers["Access-Control-Allow-Headers"] = ["*"]
  }

  headers["Access-Control-Allow-Credentials"] = [options.allowCredentials.toString()]
  headers["Access-Control-Max-Age"] = [options.maxAge.toString(10)]
  headers["Access-Control-Expose-Headers"] = options.exposeHeaders
  return headers
}

// TODO allow plain origin strings
export const corsMiddleware = (options: Partial<CorsMiddlewareOptions> = {}): Middleware => {
  const completeOptions = withDefaults(options, {
    allowOrigins: "*",
    exposeHeaders: [],
    allowCredentials: false,
    allowedMethods: "*",
    allowedHeaders: "*",
    maxAge: 600, // Ten minutes
  })
  const defaultHeaders = getDefaultHeaders(completeOptions)
  return new CorsMiddleware(
    defaultHeaders,
    !Array.isArray(completeOptions.allowedHeaders),
    "allowedOriginRegex" in options && options.allowedOriginRegex ? options.allowedOriginRegex : null,
    "allowOriginFunction" in options && options.allowOriginFunction ? options.allowOriginFunction : null
  )
}
