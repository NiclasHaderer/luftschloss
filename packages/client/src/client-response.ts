import http from "node:http";
import { Headers, UTF8SearchParams } from "@luftschloss/server";
import { ByLazy, ContentType, parseContentType } from "@luftschloss/common";

export class ClientResponse {
  constructor(public readonly raw: http.IncomingMessage, public readonly url: URL) {}

  public get status(): number {
    return this.raw.statusCode!;
  }

  public get headers() {
    return Headers.create(this.raw.headers);
  }

  @ByLazy<ContentType, ClientResponse>(self => {
    const contentType = self.headers.get("content-type");
    if (contentType) {
      return parseContentType(contentType);
    } else {
      return {
        type: undefined,
        parameters: {},
        encoding: undefined,
        matches: (contentType: string) => contentType === "*/*",
      };
    }
  })
  public readonly contentType!: ContentType;

  public async *chunks(): AsyncGenerator<Buffer> {
    for await (const chunk of this.raw) {
      yield chunk;
    }
  }

  public async buffer(contentType = "*/*"): Promise<Buffer> {
    if (!this.contentType.matches(contentType)) {
      throw new Error(`Wrong content type: Expected ${contentType}, got ${this.contentType.type}`);
    }
    const buffers = [];
    for await (const chunk of this.chunks()) {
      buffers.push(chunk);
    }
    return Promise.all(buffers).then(buffers => Buffer.concat(buffers));
  }

  public json<T extends object>(contentType = "application/json"): Promise<T> {
    if (!this.contentType.matches(contentType)) {
      throw new Error(`Wrong content type: Expected ${contentType}, got ${this.contentType.type}`);
    }
    return this.text("*/*").then(text => JSON.parse(text));
  }

  public form<T extends Record<string, string[]> = Record<string, string[]>>(
    contentType = "application/x-www-form-urlencoded"
  ): Promise<UTF8SearchParams<T>> {
    if (!this.contentType.matches(contentType)) {
      throw new Error(`Wrong content type: Expected ${contentType}, got ${this.contentType.type}`);
    }
    return this.text("*/*").then(text => new UTF8SearchParams<T>(text));
  }

  public text(contentType = "text/*"): Promise<string> {
    if (!this.contentType.matches(contentType)) {
      throw new Error(`Wrong content type: Expected ${contentType}, got ${this.contentType.type}`);
    }
    return this.buffer().then(buffer => buffer.toString());
  }
}
