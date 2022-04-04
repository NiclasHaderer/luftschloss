import { HTTP_METHODS } from "./route-collector.model"
import { URL } from "url"
import { IncomingMessage } from "http"
import { CustomPropertyDescriptor, Func } from "../types"
import { RequestImpl } from "./request-impl"
import { Headers } from "./headers"

export interface Request<P extends object = any, T extends object = any> {
  readonly data: T
  readonly raw: IncomingMessage
  readonly parameters: URLSearchParams
  readonly pathParams: P
  readonly path: string
  readonly method: HTTP_METHODS
  readonly url: URL
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
