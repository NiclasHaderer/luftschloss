import { ServerResponse } from "http"
import { Status, toStatus } from "./status"
import { Headers } from "./headers"
import type { Response } from "./response"
import type { Request } from "./request"
import { ReadStream } from "fs"

export class ResponseImpl implements Response {
  private _status: Status = Status.HTTP_200_OK
  private _headers = new Headers()

  private data: ReadStream | Buffer | null | string = null

  constructor(private readonly res: ServerResponse, public readonly request: Request) {}

  public get raw(): ServerResponse {
    return this.res
  }

  public bytes(bytes: Buffer): this {
    this.data = bytes
    return this
  }

  public get complete(): boolean {
    return this.res.writableEnded
  }

  public get headers(): Headers {
    return this._headers
  }

  public header(name: string, value: string): this {
    this._headers.append(name, value)
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

  public getStatus(): Status {
    return this._status
  }

  public status(status: Status | number): this {
    this._status = toStatus(status)
    return this
  }

  public stream(stream: ReadStream): this {
    this.data = stream
    return this
  }

  public text(text: string): this {
    this.headers.append("Content-Type", "text/plain")
    this.data = text
    return this
  }

  public async end(): Promise<void> {
    this.res.writeHead(this._status.code, this.headers.encode())
    if (this.data instanceof ReadStream) {
      await this.streamResponse(this.data)
    } else {
      // Null cannot be written to stdout and ?? checks for undefined and null
      this.res.write(this.data ?? "")
    }
    this.res.end()
  }

  private streamResponse(stream: ReadStream): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      stream.on("open", () => stream.pipe(this.res))
      stream.on("close", resolve)
      stream.on("error", reject)
    })
  }
}
