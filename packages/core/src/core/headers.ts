/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { IncomingHttpHeaders } from "http"
import { saveObject } from "./utils"

export class Headers {
  private headers = new Map<string, Set<string>>()

  public append(name: string, value: string): void {
    name = Headers.cleanHeaderName(name)

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
    name = Headers.cleanHeaderName(name)
    this.headers.delete(name)
  }

  public entries(): IterableIterator<[string, Set<string>]> {
    return this.headers.entries()
  }

  public get(name: string): string | null {
    name = Headers.cleanHeaderName(name)
    const [first] = this.headers.get(name) || []
    return first || null
  }

  public getAll(name: string): Set<string> | null {
    name = Headers.cleanHeaderName(name)
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
    const encodedHeaders: Record<string, string> = saveObject()
    for (const [name, [...value]] of this.entries()) {
      encodedHeaders[name] = value.join(", ")
    }
    return encodedHeaders
  }

  private static cleanHeaderName(name: string): string {
    return name.trim().toLowerCase()
  }

  public static create(nodeHeaders: IncomingHttpHeaders): Headers {
    const headers = new Headers()
    for (const [name, value] of Object.values(nodeHeaders) as [string, string][]) {
      headers.append(name, value)
    }

    return headers
  }
}
