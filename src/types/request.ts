import { HTTP_METHODS } from "./http"

export interface Request<T extends Record<string, any> | unknown = unknown> {
  readonly completed: boolean
  readonly data: T
  readonly method: HTTP_METHODS
  respondBytes: (status: number, byte: Buffer) => void
  respondJson: (status: number, object: object) => void
  respondText: (status: number, text: string) => void
  readonly url: string
}
