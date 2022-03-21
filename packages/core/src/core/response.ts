import { URL } from "url"
import { Headers } from "./headers"
import { Status } from "./status"
import { ValueOf } from "../types"
import { Stream } from "stream"
import { ServerResponse } from "http"
import { Request } from "./request"

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

  getStatus(): ValueOf<typeof Status>

  status(status: ValueOf<typeof Status>): this

  stream(stream: Stream): this

  text(text: string): this
}

export const extendResponse = <R extends Response>(
  methods: Partial<{
    [key in keyof R]: R[key] extends (...args: any) => any
      ? (this: R, ...args: Parameters<R[key]>) => ReturnType<R[key]>
      : R[key]
  }>
): void => {
  // TODO
}
