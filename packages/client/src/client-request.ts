import http from "node:http";
import https from "node:https";
import { ClientResponse } from "./client-response";
import { getTypeOf, Headers, Subscribable } from "@luftschloss/common";
import { ClientOptions, ClientOptionsWithBody } from "./methods";
import { Stream } from "node:stream";

const supportedProtocols = new Set(["http:", "https:"]);

class RedirectEvent {
  constructor(public readonly uri: URL, public readonly preventRedirect: () => void) {}
}

interface RequestEvents {
  redirect: RedirectEvent;
}

const redirectStatusCodes = new Set([301, 302, 303, 307, 308]);

export class ClientRequest extends Subscribable<RequestEvents> {
  private executor!: typeof http.request | typeof https.request;
  private readonly history: ClientResponse[] = [];
  private headers: Headers;
  private data: string | Buffer | NodeJS.ReadableStream | URLSearchParams | object | undefined;
  private readonly maxRedirects: number;
  private readonly followRedirects: boolean;

  constructor(
    uri: string | URL,
    private _method: string,
    options: Readonly<Required<ClientOptions> & Partial<ClientOptionsWithBody>>,
    private readonly userAgent = "@luftschloss/client"
  ) {
    super();
    this.url = uri;
    this.headers = options.headers instanceof Headers ? options.headers : Headers.create(options.headers);
    this.data = options.data;
    this.maxRedirects = options.maxRedirects;
    this.followRedirects = options.followRedirects;
  }

  private _url!: URL;

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

  public get redirectCount(): number {
    return this.history.length;
  }

  public get method(): string {
    return this._method;
  }

  public async send(): Promise<ClientResponse> {
    const [rawRequest, rawResponse] = await this.getResponse();

    return this.warpResponse(rawResponse)
      .catch(error => {
        this.history.forEach(response => response.raw.destroyed || response.raw.destroy(error));
        if (this.data instanceof Stream.Readable && !this.data.destroyed) {
          this.data.destroy(error);
        }
        throw error;
      })
      .finally(() => rawRequest.destroy());
  }

  private async warpResponse(rawResponse: http.IncomingMessage): Promise<ClientResponse> {
    const wrappedResponse = new ClientResponse(rawResponse, this.url, [...this.history]);
    if (
      this.followRedirects &&
      this.redirectCount < this.maxRedirects &&
      redirectStatusCodes.has(wrappedResponse.status) &&
      wrappedResponse.headers.has("location")
    ) {
      let newURL: URL;
      try {
        newURL = new URL(wrappedResponse.headers.get("location")!);
      } catch (e) {
        throw new Error(`Invalid redirect location: ${wrappedResponse.headers.get("location")}`);
      }

      if (
        wrappedResponse.status === 303 ||
        ((wrappedResponse.status === 301 || wrappedResponse.status === 302) && this._method === "POST")
      ) {
        this._method = "GET";
        this.data = undefined;
        this.headers.delete("content-length");
        this.headers.delete("content-type");
      }

      let shouldFollow = true;
      await this._emitSync("redirect", new RedirectEvent(newURL, () => (shouldFollow = false)));
      if (!shouldFollow) {
        return wrappedResponse;
      } else {
        // Remove headers that are not allowed to be sent with a redirect
        if (
          newURL.protocol !== this.url.protocol ||
          (newURL.host !== this.url.host && !newURL.host.endsWith(`.${this.url.host}`))
        ) {
          for (const name of ["authorization", "www-authenticate", "cookie", "cookie2"]) {
            this.headers.delete(name);
          }
        }
        // TODO decide if the redirect responses should be destroyed
        // TODO referrer policy
        this.history.push(wrappedResponse);
        this.url = newURL;
        return this.send();
      }
    }

    return wrappedResponse;
  }

  private getResponse(): Promise<[http.ClientRequest, http.IncomingMessage]> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises,no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const abort = (e: Error) => {
        clientRequest.destroyed || clientRequest.destroy(e);
        if (this.data instanceof Stream.Readable && !this.data.destroyed) {
          this.data.destroy(e);
        }
        reject(e);
      };

      if (!this.headers.has("content-type") && this.data) {
        const contentType = this.getContentType();
        contentType && this.headers.set("content-type", contentType);
      }

      const clientRequest: http.ClientRequest = this.executor(
        this.url,
        {
          method: this._method,
          headers: {
            "user-agent": this.userAgent,
            ...this.headers.encode(),
          },
        },
        res => resolve([clientRequest, res])
      )
        .on("error", e => abort(new Error(`Request error: ${e.message}`)))
        .on("timeout", () => abort(new Error("Request timed out")))
        .on("close", () => abort(new Error("Connection closed")));

      this.writeDataToMessage(clientRequest)
        .then(() => clientRequest.end())
        .catch(abort);
    });
  }

  private getContentType(): string | undefined {
    if (typeof this.data === "string") {
      return "text/plain";
    } else if (this.data instanceof Buffer) {
      return "application/octet-stream";
    } else if (this.data instanceof URLSearchParams) {
      return "application/x-www-form-urlencoded";
    } else if (this.data instanceof Stream) {
      return "application/octet-stream";
    } else if (typeof this.data === "object") {
      return "application/json";
    }
    return undefined;
  }

  private async writeDataToMessage(message: http.ClientRequest) {
    return new Promise<void>((resolve, reject) => {
      if (this.data === undefined || this.data === null) {
        resolve();
      } else if (typeof this.data === "string") {
        message.write(this.data);
        resolve();
      } else if (this.data instanceof Buffer) {
        message.write(this.data);
        resolve();
      } else if (this.data instanceof URLSearchParams) {
        message.write(this.data.toString());
        resolve();
      } else if (this.data instanceof Stream) {
        this.data.pipe(message);
        this.data.on("error", e => reject(new Error(`Stream error: ${e.message}`)));
        this.data.on("end", resolve);
      } else if (typeof this.data === "object") {
        message.write(JSON.stringify(this.data));
        resolve();
      } else {
        return reject(
          `Unsupported data type: ${getTypeOf(
            this.data
          )}. Accepted data types are: string, Buffer, URLSearchParams, Stream, object`
        );
      }
    });
  }
}
