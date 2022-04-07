/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { HTTP_METHODS } from "./route-collector.model"
import { IncomingMessage } from "http"
import { CustomPropertyDescriptor, Func } from "../types"
import { RequestImpl } from "./request-impl"
import { Headers } from "./headers"
import { UTF8Url } from "./utf8-url"
import { Utf8SearchParams } from "./utf8-search-params"

export interface Request<P extends object = any, T extends Record<string, unknown> = any> {
  readonly data: T
  readonly raw: IncomingMessage
  // TODO perhaps same arrangement like the urlParams?
  readonly urlParams: Utf8SearchParams
  readonly pathParams: P
  readonly path: string
  readonly method: HTTP_METHODS
  readonly url: UTF8Url
  readonly headers: Headers
}

export const addRequestField = <R extends Request, KEY extends PropertyKey>(
  fieldName: KEY,
  field: CustomPropertyDescriptor<R, KEY>
): void => {
  Object.defineProperty(RequestImpl.prototype, fieldName, field)
}

export const overwriteRequestMethod = <R extends Request, KEY extends keyof R>(
  fieldName: KEY,
  methodFactory: (original: R[KEY] extends Func ? R[KEY] : never) => CustomPropertyDescriptor<R, KEY>
): void => {
  const originalMethod = (RequestImpl.prototype as unknown as R)[fieldName]
  if (!originalMethod) throw new Error(`Cannot override method ${fieldName.toString()}`)
  const newMethod = methodFactory(originalMethod as R[KEY] extends Func ? R[KEY] : never)
  addRequestField(fieldName, newMethod)
}
