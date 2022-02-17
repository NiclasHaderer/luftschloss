import { HTTP_METHODS } from "./http"

export interface Request<T extends Record<string, any> | unknown = unknown> {
  readonly completed: boolean
  readonly data: T
  readonly method: HTTP_METHODS
  readonly url: string
}
