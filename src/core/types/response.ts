import { Status } from "../impl/status"
import { ValueOf } from "../types"
import { ReadStream } from "fs"
import ReadableStream = NodeJS.ReadableStream

export interface Response {
  bytes(byte: Buffer): this

  file(path: string): this

  html(object: string): this

  json(object: object): this

  redirect(url: string | URL): this

  status(status: ValueOf<typeof Status>): this

  stream(stream: ReadStream | ReadableStream): this

  text(text: string): this
}

// TODO every handler returns a response which in turn has to implement this interface
// TODO The won't (most of the time) access the response object directly, except if he creates his own middleware
