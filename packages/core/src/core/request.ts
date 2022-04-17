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
import { UTF8SearchParams } from "./utf8-search-params"

export interface LRequest<DATA extends Record<string, unknown> = never> {
  readonly data: DATA
  readonly raw: IncomingMessage

  urlParams: UTF8SearchParams

  pathParams<T extends object>(): T

  readonly path: string
  readonly method: HTTP_METHODS
  readonly url: UTF8Url
  readonly headers: Headers
}

export const addRequestField = <R extends LRequest, KEY extends PropertyKey>(
  fieldName: KEY,
  field: CustomPropertyDescriptor<R, KEY>
): void => {
  Object.defineProperty(RequestImpl.prototype, fieldName, field)
}

export const overwriteRequestMethod = <R extends LRequest, KEY extends keyof R>(
  fieldName: KEY,
  methodFactory: (original: R[KEY] extends Func ? R[KEY] : never) => CustomPropertyDescriptor<R, KEY>
): void => {
  const originalMethod = (RequestImpl.prototype as unknown as R)[fieldName]
  if (!originalMethod) throw new Error(`Cannot override method ${fieldName.toString()}`)
  const newMethod = methodFactory(originalMethod as R[KEY] extends Func ? R[KEY] : never)
  addRequestField(fieldName, newMethod)
}
