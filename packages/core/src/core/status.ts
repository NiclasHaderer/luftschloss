/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { ValueOf } from "../types"
import { HTTPException } from "./http-exception"

/**
 * See https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
 */
export const Status = {
  HTTP_100_CONTINUE: {
    code: 100,
    message: "Continue",
    key: "HTTP_100_CONTINUE",
  },
  HTTP_101_SWITCHING_PROTOCOLS: {
    code: 101,
    message: "Switching Protocols",
    key: "HTTP_101_SWITCHING_PROTOCOLS",
  },
  HTTP_102_PROCESSING: {
    code: 102,
    message: "Processing",
    key: "HTTP_102_PROCESSING",
  },
  HTTP_103_EARLY_HINTS: {
    code: 103,
    message: "Early Hints",
    key: "HTTP_103_EARLY_HINTS",
  },
  HTTP_200_OK: {
    code: 200,
    message: "OK",
    key: "HTTP_200_OK",
  },
  HTTP_201_CREATED: {
    code: 201,
    message: "Created",
    key: "HTTP_201_CREATED",
  },
  HTTP_202_ACCEPTED: {
    code: 202,
    message: "Accepted",
    key: "HTTP_202_ACCEPTED",
  },
  HTTP_203_NON_AUTHORITATIVE_INFORMATION: {
    code: 203,
    message: "Non-Authoritative Information",
    key: "HTTP_203_NON_AUTHORITATIVE_INFORMATION",
  },
  HTTP_204_NO_CONTENT: {
    code: 204,
    message: "No Content",
    key: "HTTP_204_NO_CONTENT",
  },
  HTTP_205_RESET_CONTENT: {
    code: 205,
    message: "Reset Content",
    key: "HTTP_205_RESET_CONTENT",
  },
  HTTP_206_PARTIAL_CONTENT: {
    code: 206,
    message: "Partial Content",
    key: "HTTP_206_PARTIAL_CONTENT",
  },
  HTTP_207_MULTI_STATUS: {
    code: 207,
    message: "Multi-Status",
    key: "HTTP_207_MULTI_STATUS",
  },
  HTTP_208_ALREADY_REPORTED: {
    code: 208,
    message: "Already Reported",
    key: "HTTP_208_ALREADY_REPORTED",
  },
  HTTP_226_IM_USED: {
    code: 226,
    message: "IM Used",
    key: "HTTP_226_IM_USED",
  },
  HTTP_300_MULTIPLE_CHOICES: {
    code: 300,
    message: "Multiple Choices",
    key: "HTTP_300_MULTIPLE_CHOICES",
  },
  HTTP_301_MOVED_PERMANENTLY: {
    code: 301,
    message: "Moved Permanently",
    key: "HTTP_301_MOVED_PERMANENTLY",
  },
  HTTP_302_FOUND: {
    code: 302,
    message: "Found",
    key: "HTTP_302_FOUND",
  },
  HTTP_303_SEE_OTHER: {
    code: 303,
    message: "See Other",
    key: "HTTP_303_SEE_OTHER",
  },
  HTTP_304_NOT_MODIFIED: {
    code: 304,
    message: "Not Modified",
    key: "HTTP_304_NOT_MODIFIED",
  },
  HTTP_305_USE_PROXY: {
    code: 305,
    message: "Use Proxy",
    key: "HTTP_305_USE_PROXY",
  },
  HTTP_306_RESERVED: {
    code: 306,
    message: "(Unused)",
    key: "HTTP_306_RESERVED",
  },
  HTTP_307_TEMPORARY_REDIRECT: {
    code: 307,
    message: "Temporary Redirect",
    key: "HTTP_307_TEMPORARY_REDIRECT",
  },
  HTTP_308_PERMANENT_REDIRECT: {
    code: 308,
    message: "Permanent Redirect",
    key: "HTTP_308_PERMANENT_REDIRECT",
  },
  HTTP_400_BAD_REQUEST: {
    code: 400,
    message: "Bad Request",
    key: "HTTP_400_BAD_REQUEST",
  },
  HTTP_401_UNAUTHORIZED: {
    code: 401,
    message: "Unauthorized",
    key: "HTTP_401_UNAUTHORIZED",
  },
  HTTP_402_PAYMENT_REQUIRED: {
    code: 402,
    message: "Payment Required",
    key: "HTTP_402_PAYMENT_REQUIRED",
  },
  HTTP_403_FORBIDDEN: {
    code: 403,
    message: "Forbidden",
    key: "HTTP_403_FORBIDDEN",
  },
  HTTP_404_NOT_FOUND: {
    code: 404,
    message: "Not Found",
    key: "HTTP_404_NOT_FOUND",
  },
  HTTP_405_METHOD_NOT_ALLOWED: {
    code: 405,
    message: "Method Not Allowed",
    key: "HTTP_405_METHOD_NOT_ALLOWED",
  },
  HTTP_406_NOT_ACCEPTABLE: {
    code: 406,
    message: "Not Acceptable",
    key: "HTTP_406_NOT_ACCEPTABLE",
  },
  HTTP_407_PROXY_AUTHENTICATION_REQUIRED: {
    code: 407,
    message: "Proxy Authentication Required",
    key: "HTTP_407_PROXY_AUTHENTICATION_REQUIRED",
  },
  HTTP_408_REQUEST_TIMEOUT: {
    code: 408,
    message: "Request Timeout",
    key: "HTTP_408_REQUEST_TIMEOUT",
  },
  HTTP_409_CONFLICT: {
    code: 409,
    message: "Conflict",
    key: "HTTP_409_CONFLICT",
  },
  HTTP_410_GONE: {
    code: 410,
    message: "Gone",
    key: "HTTP_410_GONE",
  },
  HTTP_411_LENGTH_REQUIRED: {
    code: 411,
    message: "Length Required",
    key: "HTTP_411_LENGTH_REQUIRED",
  },
  HTTP_412_PRECONDITION_FAILED: {
    code: 412,
    message: "Precondition Failed",
    key: "HTTP_412_PRECONDITION_FAILED",
  },
  HTTP_413_REQUEST_ENTITY_TOO_LARGE: {
    code: 413,
    message: "Content Too Large",
    key: "HTTP_413_REQUEST_ENTITY_TOO_LARGE",
  },
  HTTP_414_REQUEST_URI_TOO_LONG: {
    code: 414,
    message: "URI Too Long",
    key: "HTTP_414_REQUEST_URI_TOO_LONG",
  },
  HTTP_415_UNSUPPORTED_MEDIA_TYPE: {
    code: 415,
    message: "Unsupported Media Type",
    key: "HTTP_415_UNSUPPORTED_MEDIA_TYPE",
  },
  HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE: {
    code: 416,
    message: "Range Not Satisfiable",
    key: "HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE",
  },
  HTTP_417_EXPECTATION_FAILED: {
    code: 417,
    message: "Expectation Failed",
    key: "HTTP_417_EXPECTATION_FAILED",
  },
  HTTP_418_IM_A_TEAPOT: {
    code: 418,
    message: "(Unused)",
    key: "HTTP_418_IM_A_TEAPOT",
  },
  HTTP_421_MISDIRECTED_REQUEST: {
    code: 421,
    message: "Misdirected Request",
    key: "HTTP_421_MISDIRECTED_REQUEST",
  },
  HTTP_422_UNPROCESSABLE_ENTITY: {
    code: 422,
    message: "Unprocessable Content",
    key: "HTTP_422_UNPROCESSABLE_ENTITY",
  },
  HTTP_423_LOCKED: {
    code: 423,
    message: "Locked",
    key: "HTTP_423_LOCKED",
  },
  HTTP_424_FAILED_DEPENDENCY: {
    code: 424,
    message: "Failed Dependency",
    key: "HTTP_424_FAILED_DEPENDENCY",
  },
  HTTP_425_TOO_EARLY: {
    code: 425,
    message: "Too Early",
    key: "HTTP_425_TOO_EARLY",
  },
  HTTP_426_UPGRADE_REQUIRED: {
    code: 426,
    message: "Upgrade Required",
    key: "HTTP_426_UPGRADE_REQUIRED",
  },
  HTTP_428_PRECONDITION_REQUIRED: {
    code: 428,
    message: "Precondition Required",
    key: "HTTP_428_PRECONDITION_REQUIRED",
  },
  HTTP_429_TOO_MANY_REQUESTS: {
    code: 429,
    message: "Too Many Requests",
    key: "HTTP_429_TOO_MANY_REQUESTS",
  },
  HTTP_431_REQUEST_HEADER_FIELDS_TOO_LARGE: {
    code: 431,
    message: "Request Header Fields Too Large",
    key: "HTTP_431_REQUEST_HEADER_FIELDS_TOO_LARGE",
  },
  HTTP_451_UNAVAILABLE_FOR_LEGAL_REASONS: {
    code: 451,
    message: "Unavailable For Legal Reasons",
    key: "HTTP_451_UNAVAILABLE_FOR_LEGAL_REASONS",
  },
  HTTP_500_INTERNAL_SERVER_ERROR: {
    code: 500,
    message: "Internal Server Error",
    key: "HTTP_500_INTERNAL_SERVER_ERROR",
  },
  HTTP_501_NOT_IMPLEMENTED: {
    code: 501,
    message: "Not Implemented",
    key: "HTTP_501_NOT_IMPLEMENTED",
  },
  HTTP_502_BAD_GATEWAY: {
    code: 502,
    message: "Bad Gateway",
    key: "HTTP_502_BAD_GATEWAY",
  },
  HTTP_503_SERVICE_UNAVAILABLE: {
    code: 503,
    message: "Service Unavailable",
    key: "HTTP_503_SERVICE_UNAVAILABLE",
  },
  HTTP_504_GATEWAY_TIMEOUT: {
    code: 504,
    message: "Gateway Timeout",
    key: "HTTP_504_GATEWAY_TIMEOUT",
  },
  HTTP_505_HTTP_VERSION_NOT_SUPPORTED: {
    code: 505,
    message: "HTTP Version Not Supported",
    key: "HTTP_505_HTTP_VERSION_NOT_SUPPORTED",
  },
  HTTP_506_VARIANT_ALSO_NEGOTIATES: {
    code: 506,
    message: "Variant Also Negotiates",
    key: "HTTP_506_VARIANT_ALSO_NEGOTIATES",
  },
  HTTP_507_INSUFFICIENT_STORAGE: {
    code: 507,
    message: "Insufficient Storage",
    key: "HTTP_507_INSUFFICIENT_STORAGE",
  },
  HTTP_508_LOOP_DETECTED: {
    code: 508,
    message: "Loop Detected",
    key: "HTTP_508_LOOP_DETECTED",
  },
  HTTP_510_NOT_EXTENDED: {
    code: 510,
    message: "Not Extended (OBSOLETED)",
    key: "HTTP_510_NOT_EXTENDED",
  },
  HTTP_511_NETWORK_AUTHENTICATION_REQUIRED: {
    code: 511,
    message: "Network Authentication Required",
    key: "HTTP_511_NETWORK_AUTHENTICATION_REQUIRED",
  },
} as const

export type Status = ValueOf<typeof Status>

export const toStatus = (code: number | Status): Status => {
  let codeObject: Status
  if (typeof code === "number") {
    const tmp = Object.values(Status).find(s => s.code === code)
    if (!tmp) {
      throw new HTTPException(Status.HTTP_500_INTERNAL_SERVER_ERROR, `Status code with status ${code} does not exist`)
    }
    codeObject = tmp
  } else {
    codeObject = code
  }

  return codeObject
}
