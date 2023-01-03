import http from "node:http"
import https from "node:https"
import { ClientResponse } from "./client-response"
import { Subscribable } from "@luftschloss/common"

const supportedProtocols = new Set(["http:", "https:"])

class RedirectEvent {
  constructor(public readonly uri: URL, public readonly preventRedirect: () => void) {}
}

interface RequestEvents {
  redirect: RedirectEvent
}

export class ClientRequest extends Subscribable<RequestEvents> {
  private _url!: URL
  private executor!: typeof http.request | typeof https.request
  private redirectCount = 0
  public readonly history: ClientResponse[] = []

  constructor(
    uri: string | URL,
    public readonly method: string,
    public readonly options: Readonly<{ followRedirects: boolean; maxRedirects: number }>,
    private readonly userAgent = "node-luftschloss-client"
  ) {
    super()
    this.url = uri
  }

  public get url(): URL {
    return this._url
  }

  protected set url(url: URL | string) {
    this._url = url instanceof URL ? url : new URL(url)
    if (!supportedProtocols.has(this.url.protocol)) {
      throw new Error(`Protocol ${this.url.protocol} is not in the supported ${Array.from(supportedProtocols)}`)
    }
    this.executor = this.url.protocol === "https:" ? https.request : http.request
  }

  public async send(): Promise<ClientResponse> {
    const rawResponse = await new Promise<http.IncomingMessage>((resolve, reject) => {
      this.executor(
        this.url,
        {
          method: this.method,
          headers: {
            "user-agent": this.userAgent,
          },
        },
        resolve
      )
        .on("error", reject)
        .on("timeout", reject)
        .on("close", reject)
        .end()
    })

    const wrappedResponse = new ClientResponse(rawResponse, this.url)

    if (
      this.options.followRedirects &&
      this.redirectCount < this.options.maxRedirects &&
      wrappedResponse.status >= 300 &&
      wrappedResponse.status < 400 &&
      wrappedResponse.headers.has("location")
    ) {
      const newURL = new URL(wrappedResponse.headers.get("location")!)
      let follow = true
      const event = new RedirectEvent(newURL, () => (follow = false))
      await this._emitSync("redirect", event)

      if (!follow) {
        return wrappedResponse
      } else {
        this.redirectCount += 1
        this.history.push(wrappedResponse)
        this.url = newURL
        return this.send()
      }
    }

    return wrappedResponse
  }
}
