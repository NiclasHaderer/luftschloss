import http from "node:http"
import { Headers, UTF8SearchParams } from "@luftschloss/server"

export class ClientResponse {
  constructor(public readonly raw: http.IncomingMessage, public readonly url: URL) {}

  public get status(): number {
    return this.raw.statusCode!
  }

  public get headers() {
    return Headers.create(this.raw.headers)
  }

  public async buffer(): Promise<Buffer> {
    const buffers = []
    for await (const chunk of this.chunks()) {
      buffers.push(chunk)
    }
    return Promise.all(buffers).then(buffers => Buffer.concat(buffers))
  }

  public async *chunks(): AsyncGenerator<Buffer> {
    for await (const chunk of this.raw) {
      yield chunk
    }
  }

  public json() {
    return this.text().then(text => JSON.parse(text))
  }

  public form() {
    return this.text().then(text => new UTF8SearchParams(text))
  }

  public text() {
    return this.buffer().then(buffer => buffer.toString())
  }
}
