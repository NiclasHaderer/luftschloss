import { IncomingHttpHeaders } from "http"

export class Headers {
  private headers = new Map<string, Set<string>>()

  public append(name: string, value: string): void {
    name = this.cleanHeaderName(name)

    if (!this.headers.has(name)) {
      this.headers.set(name, new Set())
    }

    const headerValues = value
      .split(",")
      .map(s => s.trim())
      .filter(s => !!s)

    for (const headerValue of headerValues) {
      this.headers.get(name)!.add(headerValue)
    }
  }

  public appendAll(name: string, value: string[] | Set<string>) {
    for (const v of value) {
      this.append(name, v)
    }
  }

  public delete(name: string): void {
    name = this.cleanHeaderName(name)
    this.headers.delete(name)
  }

  public entries(): IterableIterator<[string, Set<string>]> {
    return this.headers.entries()
  }

  public get(name: string): string | null {
    name = this.cleanHeaderName(name)
    const [first] = this.headers.get(name) || []
    return first || null
  }

  public getAll(name: string): Set<string> | null {
    name = this.cleanHeaderName(name)
    return this.headers.get(name) || null
  }

  public has(name: string): boolean {
    name = name.toLowerCase()
    return this.headers.has(name)
  }

  public keys(): IterableIterator<string> {
    return this.headers.keys()
  }

  public values(): IterableIterator<Set<string>> {
    return this.headers.values()
  }

  public encode(): Record<string, string> {
    const encodedHeaders: Record<string, string> = {}
    for (const [name, [...value]] of this.entries()) {
      encodedHeaders[name] = value.join(", ")
    }
    return encodedHeaders
  }

  private cleanHeaderName(name: string): string {
    return name.trim().toLowerCase()
  }

  static create(nodeHeaders: IncomingHttpHeaders): Headers {
    const headers = new Headers()
    for (const [name, value] of Object.values(nodeHeaders) as [string, string][]) {
      headers.append(name, value)
    }

    return headers
  }
}