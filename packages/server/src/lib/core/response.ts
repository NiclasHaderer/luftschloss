/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { CustomPropertyDescriptor, Func } from "@luftschloss/common"
import { ReadStream } from "fs"
import { ServerResponse } from "http"
import { URL } from "url"
import { Headers } from "./headers"
import { LRequest } from "./request"
import { ResponseImpl } from "./response-impl"
import { Status } from "./status"

export interface LResponse {
  readonly complete: boolean
  readonly headers: Headers
  readonly raw: ServerResponse
  readonly request: LRequest

  bytes(bytes: Buffer): this

  header(name: string, value: string): this

  html(text: string): this

  empty(): this

  json(object: object | string): this

  redirect(url: string | URL): this

  getStatus(): Status

  status(status: Status | number): this

  stream(stream: ReadStream | ReadStream[]): this

  text(text: string): this

  end(): Promise<void>
}

export const addResponseField = <R extends LResponse, KEY extends PropertyKey>(
  fieldName: KEY,
  field: CustomPropertyDescriptor<R, KEY>
): void => {
  Object.defineProperty(ResponseImpl.prototype, fieldName, field)
}

export const overwriteResponseMethod = <R extends LResponse, KEY extends keyof R>(
  fieldName: KEY,
  methodFactory: (original: R[KEY] extends Func ? R[KEY] : never) => CustomPropertyDescriptor<R, KEY>
): void => {
  const originalMethod = (ResponseImpl.prototype as unknown as R)[fieldName]
  if (!originalMethod) throw new Error(`Cannot override method ${fieldName.toString()}`)
  const newMethod = methodFactory(originalMethod as R[KEY] extends Func ? R[KEY] : never)
  addResponseField(fieldName, newMethod)
}
