/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { saveObject } from "@luftschloss/core"
import { IncomingHttpHeaders } from "http"

export class Headers {
  private headers = new Map<string, Set<string>>()

  public static create(nodeHeaders: IncomingHttpHeaders): Headers {
    const headers = new Headers()
    for (const [name, value] of Object.entries(nodeHeaders) as [string, string][]) {
      headers.append(name, value)
    }

    return headers
  }

  private static cleanHeaderName(name: string): string {
    return name.trim().toLowerCase()
  }

  public append(name: string, value: string | number): void {
    name = Headers.cleanHeaderName(name)

    if (!this.headers.has(name)) {
      this.headers.set(name, new Set())
    }

    const headerValues = value
      .toString()
      .split(",")
      .map(s => s.trim())
      .filter(s => !!s)

    for (const headerValue of headerValues) {
      this.headers.get(name)!.add(headerValue)
    }
  }

  public appendAll(name: string, value: Iterable<string | number>): void {
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

  public set(name: string, value: string | string[]): void {
    name = Headers.cleanHeaderName(name)
    let valueSet: Set<string>
    if (Array.isArray(value)) {
      valueSet = new Set(value)
    } else {
      valueSet = new Set([value])
    }
    this.headers.set(name, valueSet)
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
}
