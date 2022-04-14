/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { ReadStream } from "fs"
import { ServerResponse } from "http"
import { URL } from "url"

import { CustomPropertyDescriptor, Func } from "../types"
import { Headers } from "./headers"
import { Request } from "./request"
import { ResponseImpl } from "./response-impl"
import { Status } from "./status"

export interface Response {
  readonly complete: boolean
  readonly headers: Headers
  readonly raw: ServerResponse
  readonly request: Request

  bytes(bytes: Buffer): this

  header(name: string, value: string): this

  html(text: string): this

  json(object: any): this

  redirect(url: string | URL): this

  getStatus(): Status

  status(status: Status | number): this

  stream(stream: ReadStream | ReadStream[]): this

  text(text: string): this
}

export const addResponseField = <R extends Response, KEY extends PropertyKey>(
  fieldName: KEY,
  field: CustomPropertyDescriptor<R, KEY>
): void => {
  Object.defineProperty(ResponseImpl.prototype, fieldName, field)
}

export const overwriteResponseMethod = <R extends Response, KEY extends keyof R>(
  fieldName: KEY,
  methodFactory: (original: R[KEY] extends Func ? R[KEY] : never) => CustomPropertyDescriptor<R, KEY>
): void => {
  const originalMethod = (ResponseImpl.prototype as unknown as R)[fieldName]
  if (!originalMethod) throw new Error(`Cannot override method ${fieldName.toString()}`)
  const newMethod = methodFactory(originalMethod as R[KEY] extends Func ? R[KEY] : never)
  addResponseField(fieldName, newMethod)
}
