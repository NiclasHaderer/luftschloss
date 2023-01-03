import http from "node:http"
import { Headers } from "@luftschloss/server"

export class ClientResponse {
  constructor(
    public readonly raw: http.IncomingMessage,
    public readonly url: URL,
    public readonly redirectedFrom: ClientResponse | undefined = undefined
  ) {}

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
    return this.buffer().then(buffer => JSON.parse(buffer.toString()))
  }

  public text() {
    return this.buffer().then(buffer => buffer.toString())
  }
}
