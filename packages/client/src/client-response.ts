import http from "node:http";
import {
  ByLazy,
  Cache,
  ContentType,
  ContentTypeString,
  Headers,
  parseContentType,
  UTF8SearchParams,
} from "@luftschloss/common";

export class ClientResponse {
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

  constructor(
    public readonly raw: http.IncomingMessage,
    public readonly url: URL,
    public readonly history: ReadonlyArray<ClientResponse>
  ) {}

  public get status(): number {
    return this.raw.statusCode!;
  }

  public get headers() {
    return Headers.create(this.raw.headers);
  }

  @Cache()
  public async buffer(): Promise<Buffer> {
    const buffers = [];
    for await (const chunk of this.raw) {
      buffers.push(chunk);
    }
    return Promise.all(buffers).then(buffers => Buffer.concat(buffers));
  }

  public json<T extends object>(contentType: ContentTypeString = "application/json"): Promise<T> {
    if (!this.contentType.matches(contentType)) {
      throw new Error(`Wrong content type: Required ${contentType}, got ${this.contentType.type}`);
    }
    return this.text("*/*").then(text => JSON.parse(text));
  }

  public form<T extends Record<string, string[]> = Record<string, string[]>>(
    contentType: ContentTypeString = "application/x-www-form-urlencoded"
  ): Promise<UTF8SearchParams<T>> {
    if (!this.contentType.matches(contentType)) {
      throw new Error(`Wrong content type: Required ${contentType}, got ${this.contentType.type}`);
    }
    return this.text("*/*").then(text => new UTF8SearchParams<T>(text));
  }

  public text(contentType: ContentTypeString = "text/*"): Promise<string> {
    if (!this.contentType.matches(contentType)) {
      throw new Error(`Wrong content type: Required ${contentType}, got ${this.contentType.type}`);
    }
    return this.buffer().then(buffer => buffer.toString(this.contentType.encoding));
  }

  public destroy(error?: Error): void {
    this.history.forEach(r => r.raw.destroyed || r.raw.destroy(error));
  }

  public raiseForStatus(): ClientResponse {
    if (this.status >= 400) {
      throw new Error(`HTTP Error ${this.status}: ${this.url}`);
    }
    return this;
  }
}
