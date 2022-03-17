import { URL } from "url"
import { Headers } from "./headers"
import { Status } from "./status"
import { ValueOf } from "../types"
import { Stream } from "stream"

export interface Response {
  readonly complete: boolean
  readonly headers: Headers

  bytes(bytes: Buffer): this

  header(name: string, value: string): this

  file(path: string): this

  html(text: string): this

  json(object: any): this

  redirect(url: string | URL): this

  getStatus(): ValueOf<typeof Status>

  status(status: ValueOf<typeof Status>): this

  stream(stream: Stream): this

  text(text: string): this
}
