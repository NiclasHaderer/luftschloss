import { ServerResponse } from "http"
import { Status } from "./status"
import { ValueOf } from "../types"
import * as fs from "fs"
import { ReadStream } from "fs"
import { HTTPException } from "./http-exception"

export class ResponseImpl {
  private _status: ValueOf<typeof Status> = Status.HTTP_200_OK

  constructor(public readonly res: ServerResponse) {}

  public bytes(byte: Buffer): this {
    // TODO add headers
    this.res.end(byte)
    return this
  }

  public file(path: string): this {
    try {
      const stream = fs.createReadStream(path)
      this.stream(stream)
    } catch {
      throw new HTTPException(Status.HTTP_404_NOT_FOUND, `File ${path} was not found`)
    }
    return this
  }

  public html(text: string): this {
    this.res.writeHead(this._status.code, { "Content-Type": "text/html" })
    this.res.end(text)
    return this
  }

  public json(object: any): this {
    this.res.writeHead(this._status.code, { "Content-Type": "application/json" })
    this.res.end(JSON.stringify(object))
    return this
  }

  public redirect(url: string | URL): this {
    // TODO
    return this
  }

  public status(status: ValueOf<typeof Status>): this {
    this._status = status
    return this
  }

  public stream(stream: ReadStream | NodeJS.ReadableStream): this {
    // TODO add stream headers
    this.res.statusCode = this._status.code
    stream.pipe(this.res)
    return this
  }

  public text(text: string): this {
    this.res.writeHead(this._status.code, { "Content-Type": "text/plain" })
    this.res.end(text)
    return this
  }
}
