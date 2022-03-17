import { HTTP_METHODS } from "./route-collector.model"
import { URL } from "url"
import { IncomingMessage } from "http"

export interface Request<T extends object = any, P extends object = any> {
  readonly data: T
  readonly raw: IncomingMessage
  readonly parameters: URLSearchParams
  readonly pathParams: P
  readonly path: string
  readonly method: HTTP_METHODS
  readonly url: URL
}
