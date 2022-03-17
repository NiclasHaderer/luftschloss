import { HTTP_METHODS } from "./route-collector.model"
import { URL } from "url"

export interface Request<
  T extends Record<string, any> | unknown = unknown,
  P extends Record<string, any> = Record<string, unknown>
> {
  readonly data: T
  readonly parameters: URLSearchParams
  readonly pathParams: P
  readonly path: string
  readonly method: HTTP_METHODS
  readonly url: URL
}
