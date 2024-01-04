/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */
import { CustomPropertyDescriptor, Func, Headers } from "@luftschloss/common";
import { ReadStream } from "fs";
import { ServerResponse } from "http";
import { LRequest } from "./request";
import { ResponseImpl } from "./response-impl";
import { Status } from "./status";

export interface LResponse {
  readonly complete: boolean;
  readonly headers: Headers;
  readonly raw: ServerResponse;
  readonly request: LRequest;

  buffer(bytes: Buffer): this;

  header(name: string, value: string | number | Iterable<string | number>): this;

  html(text: string): this;

  empty(setStatus?: boolean): this;

  json(object: object | string | null | boolean): this;

  form(data: ConstructorParameters<typeof URLSearchParams>[0]): this;

  redirect(
    url: string | URL,
    type?:
      | typeof Status.HTTP_301_MOVED_PERMANENTLY
      | typeof Status.HTTP_302_FOUND
      | typeof Status.HTTP_307_TEMPORARY_REDIRECT
      | typeof Status.HTTP_308_PERMANENT_REDIRECT
      | 301
      | 302
      | 307
      | 308
  ): this;

  getStatus(): Status;

  status(status: Status | number): this;

  stream(stream: ReadStream | ReadStream[]): this;

  text(text: string): this;
}

export const addResponseField = <R extends LResponse, KEY extends PropertyKey>(
  fieldName: KEY,
  field: CustomPropertyDescriptor<R, KEY>
): void => {
  Object.defineProperty(ResponseImpl.prototype, fieldName, field);
};

export const overwriteResponseMethod = <R extends LResponse, KEY extends keyof R>(
  fieldName: KEY,
  methodFactory: (original: R[KEY] extends Func ? R[KEY] : never) => CustomPropertyDescriptor<R, KEY>
): void => {
  const originalMethod = (ResponseImpl.prototype as unknown as R)[fieldName];
  if (!originalMethod) throw new Error(`Cannot override method ${fieldName.toString()}`);
  const newMethod = methodFactory(originalMethod as R[KEY] extends Func ? R[KEY] : never);
  addResponseField(fieldName, newMethod);
};
