import { ServerResponse } from "http"
import { Status } from "./status"
import { ValueOf } from "../types"
import * as fs from "fs"
import { HTTPException } from "./http-exception"
import { Headers } from "./headers"
import { Stream } from "stream"
import type { Response } from "./response"
import type { Request } from "./request"

export class ResponseImpl implements Response {
  private _status: ValueOf<typeof Status> = Status.HTTP_200_OK
  private _headers = new Headers()
  private _complete = false

  private data: Stream | Buffer | null | string = null

  constructor(private readonly res: ServerResponse, public readonly request: Request) {}

  public get raw(): ServerResponse {
    return this.res
  }

  public bytes(bytes: Buffer): this {
    this.data = bytes
    return this
  }

  public get complete(): boolean {
    return this._complete
  }

  public get headers(): Headers {
    return this._headers
  }

  public header(name: string, value: string): this {
    this._headers.append(name, value)
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
    this.headers.append("Content-Type", "text/html")
    this.data = text
    return this
  }

  public json(object: any): this {
    this.headers.append("Content-Type", "application/json")
    this.data = JSON.stringify(object)
    return this
  }

  public redirect(url: string | URL): this {
    this.status(Status.HTTP_307_TEMPORARY_REDIRECT)
    this.headers.append("Location", url.toString())
    return this
  }

  public getStatus(): ValueOf<typeof Status> {
    return this._status
  }

  public status(status: ValueOf<typeof Status>): this {
    this._status = status
    return this
  }

  public stream(stream: Stream): this {
    this.data = stream
    return this
  }

  public text(text: string): this {
    this.headers.append("Content-Type", "text/plain")
    this.data = text
    return this
  }

  public end(): void {
    this.res.writeHead(this._status.code, this.headers.encode())
    if (this.data instanceof Stream) {
      this.data.pipe(this.res)
    } else {
      // Null cannot be written to stdout and ?? checks for undefined and null
      this.res.write(this.data ?? "")
    }
    this._complete = true
    this.res.end()
  }
}
