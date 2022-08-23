/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { normalizePath } from "@luftschloss/common"
import { URL } from "url"
import { UTF8SearchParams } from "./utf8-search-params"

const UTF_8_SYMBOL = Symbol("UTF_8_SYMBOL")

export class UTF8Url implements URL {
  public [UTF_8_SYMBOL] = true

  private urlDelegate!: URL

  public constructor(...args: ConstructorParameters<typeof URL>) {
    this.urlDelegate = new URL(...args)
  }

  public get username(): string {
    return decodeURIComponent(this.urlDelegate.username)
  }

  public set username(value: string) {
    this.urlDelegate.username = value
  }

  public get search(): string {
    return decodeURIComponent(this.urlDelegate.search)
  }

  public set search(value: string) {
    this.urlDelegate.search = value
  }

  public get protocol(): string {
    return this.urlDelegate.protocol
  }

  public set protocol(value: string) {
    this.urlDelegate.protocol = value
  }

  public get port(): string {
    return this.urlDelegate.port
  }

  public set port(value: string) {
    this.urlDelegate.port = value
  }

  public get pathname(): string {
    return normalizePath(decodeURIComponent(this.urlDelegate.pathname))
  }

  public set pathname(value: string) {
    this.urlDelegate.pathname = value
  }

  public get password(): string {
    return decodeURIComponent(this.urlDelegate.password)
  }

  public set password(value: string) {
    this.urlDelegate.password = value
  }

  public get href(): string {
    return decodeURIComponent(this.urlDelegate.href)
  }

  public set href(value: string) {
    this.urlDelegate.href = value
  }

  public get hostname(): string {
    return decodeURIComponent(this.urlDelegate.hostname)
  }

  public set hostname(value: string) {
    this.urlDelegate.hostname = value
  }

  public get host(): string {
    return decodeURIComponent(this.urlDelegate.host)
  }

  public set host(value: string) {
    this.urlDelegate.host = value
  }

  public get hash(): string {
    return decodeURIComponent(this.urlDelegate.hash)
  }

  public set hash(value: string) {
    this.urlDelegate.hash = value
  }

  public toString(): string {
    return decodeURIComponent(this.urlDelegate.toString())
  }

  public get searchParams(): UTF8SearchParams {
    return new UTF8SearchParams(this.urlDelegate.searchParams)
  }

  public get origin() {
    return decodeURIComponent(this.urlDelegate.origin)
  }

  public toJSON(): string {
    return this.toString()
  }
}
