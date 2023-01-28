/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import {
  ContentTypeString,
  CustomPropertyDescriptor,
  Func,
  Headers,
  UTF8SearchParams,
  UTF8Url,
} from "@luftschloss/common";
import {IncomingMessage} from "http";
import {RequestImpl} from "./request-impl";
import {HTTP_METHODS} from "./route-collector.model";

export interface LRequest<DATA extends Record<string, unknown> = never> {
  readonly data: DATA;
  readonly raw: IncomingMessage;
  urlParams: UTF8SearchParams;
  readonly path: string;
  readonly method: HTTP_METHODS;
  readonly url: UTF8Url;
  readonly headers: Headers;

  pathParams<T extends object>(): T;

  text(contentType?: ContentTypeString, maxBodySize?: number): Promise<string>;

  form<T extends Record<string, string[]> = Record<string, string[]>>(
    contentType?: ContentTypeString,
    maxBodySize?: number
  ): Promise<UTF8SearchParams<T>>;

  json<T extends object>(contentType?: ContentTypeString, maxBodySize?: number): Promise<T>;

  buffer(maxBodySize?: number): Promise<Buffer>;
}

export const addRequestField = <R extends LRequest, KEY extends PropertyKey>(
  fieldName: KEY,
  field: CustomPropertyDescriptor<R, KEY>
): void => {
  Object.defineProperty(RequestImpl.prototype, fieldName, field);
};

export const overwriteRequestMethod = <R extends LRequest, KEY extends keyof R>(
  fieldName: KEY,
  methodFactory: (original: R[KEY] extends Func ? R[KEY] : never) => CustomPropertyDescriptor<R, KEY>
): void => {
  const originalMethod = (RequestImpl.prototype as unknown as R)[fieldName];
  if (!originalMethod) throw new Error(`Cannot override method ${fieldName.toString()}`);
  const newMethod = methodFactory(originalMethod as R[KEY] extends Func ? R[KEY] : never);
  addRequestField(fieldName, newMethod);
};
