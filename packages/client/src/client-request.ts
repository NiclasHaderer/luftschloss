import http from "node:http";
import https from "node:https";
import { ClientResponse } from "./client-response";
import { getTypeOf, Subscribable } from "@luftschloss/common";
import { ClientOptions, ClientOptionsWithBody } from "./methods";
import { Headers } from "@luftschloss/server";
import { Stream } from "stream";

const supportedProtocols = new Set(["http:", "https:"]);

class RedirectEvent {
  constructor(public readonly uri: URL, public readonly preventRedirect: () => void) {}
}

interface RequestEvents {
  redirect: RedirectEvent;
}

export class ClientRequest extends Subscribable<RequestEvents> {
  private _url!: URL;
  private executor!: typeof http.request | typeof https.request;
  private redirectCount = 0;
  public readonly history: ClientResponse[] = [];
  private headers: Headers;

  constructor(
    uri: string | URL,
    public readonly method: string,
    public readonly options: Required<ClientOptions> & Partial<ClientOptionsWithBody>,
    private readonly userAgent = "node-luftschloss-client"
  ) {
    super();
    this.url = uri;
    this.headers = options.headers instanceof Headers ? options.headers : Headers.create(options.headers);
  }

  public get url(): URL {
    return this._url;
  }

  protected set url(url: URL | string) {
    this._url = url instanceof URL ? url : new URL(url);
    if (!supportedProtocols.has(this.url.protocol)) {
      throw new Error(`Protocol ${this.url.protocol} is not in the supported ${Array.from(supportedProtocols)}`);
    }
    this.executor = this.url.protocol === "https:" ? https.request : http.request;
  }

  public async send(): Promise<ClientResponse> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises,no-async-promise-executor
    const rawResponse = await new Promise<http.IncomingMessage>(async (resolve, reject) => {
      let contentType: string | undefined;
      if (!this.headers.has("content-type") && this.options.data) {
        if (typeof this.options.data === "string") {
          contentType = "text/plain";
        } else if (this.options.data instanceof Buffer) {
          contentType = "application/octet-stream";
        } else if (this.options.data instanceof URLSearchParams) {
          contentType = "application/x-www-form-urlencoded";
        } else if (this.options.data instanceof Stream) {
          contentType = "application/octet-stream";
        } else if (typeof this.options.data === "object") {
          contentType = "application/json";
        }
        contentType && this.headers.set("content-type", contentType);
      }

      const message = this.executor(
        this.url,
        {
          method: this.method,
          headers: {
            "user-agent": this.userAgent,
            ...this.headers.encode(),
          },
        },
        resolve
      )
        .on("error", reject)
        .on("timeout", reject)
        .on("close", reject);

      if (this.options.data) {
        if (typeof this.options.data === "string") {
          message.write(this.options.data);
        } else if (this.options.data instanceof Buffer) {
          message.write(this.options.data);
        } else if (this.options.data instanceof URLSearchParams) {
          message.write(this.options.data.toString());
        } else if (this.options.data instanceof Stream) {
          const data = this.options.data;
          // TODO check if this is the correct way to handle streams
          data.pipe(message);
          data.on("error", reject);
          await new Promise<void>(resolve => data.on("end", resolve));
        } else if (typeof this.options.data === "object") {
          message.write(JSON.stringify(this.options.data));
        } else {
          return reject(
            `Unsupported data type: ${getTypeOf(
              this.options.data
            )}. Accepted data types are: string, Buffer, URLSearchParams, Stream, object`
          );
        }
      }
      message.end();
    });

    const wrappedResponse = new ClientResponse(rawResponse, this.url);

    if (
      this.options.followRedirects &&
      this.redirectCount < this.options.maxRedirects &&
      wrappedResponse.status >= 300 &&
      wrappedResponse.status < 400 &&
      wrappedResponse.headers.has("location")
    ) {
      const newURL = new URL(wrappedResponse.headers.get("location")!);
      let follow = true;
      const event = new RedirectEvent(newURL, () => (follow = false));
      await this._emitSync("redirect", event);

      if (!follow) {
        return wrappedResponse;
      } else {
        this.redirectCount += 1;
        this.history.push(wrappedResponse);
        this.url = newURL;
        return this.send();
      }
    }

    return wrappedResponse;
  }
}
