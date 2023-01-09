/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import {saveObject} from "./utils";
import {URLSearchParams} from "url";

const UTF_8_SYMBOL = Symbol("UTF_8_SYMBOL");

export class UTF8SearchParams<T extends Record<string, string[]> = Record<string, string[]>> extends URLSearchParams {
  public [UTF_8_SYMBOL] = true;

  public constructor(...init: ConstructorParameters<typeof URLSearchParams>) {
    super(...init);
  }

  public [Symbol.iterator](): IterableIterator<[string, string]>;
  public [Symbol.iterator](): Iterator<[string, string]>;
  public [Symbol.iterator](): IterableIterator<[string, string]> | Iterator<[string, string]> {
    return this.entries();
  }

  public override *entries(): IterableIterator<[string, string]> {
    for (const [key, value] of super.entries()) {
      yield [decodeURIComponent(key), decodeURIComponent(value)];
    }
  }

  public forEach<TThis = this>(
    callback: (this: TThis, value: string, name: string, searchParams: this) => void,
    thisArg?: TThis
  ) {
    super.forEach((value, name) => {
      callback.apply(thisArg!, [decodeURIComponent(value), decodeURIComponent(name), this]);
    });
  }

  public override get(name: string): string | null {
    const value = super.get(name);
    if (value === null) return null;
    return decodeURIComponent(value);
  }

  public override getAll(name: string): string[] {
    return super.getAll(name).map(decodeURIComponent);
  }

  public override *keys(): IterableIterator<string> {
    for (const key of super.keys()) {
      yield decodeURIComponent(key);
    }
  }

  public override *values(): IterableIterator<string> {
    for (const value of super.values()) {
      yield decodeURIComponent(value);
    }
  }

  public encode<V extends Record<string, string[]> = T>(): V {
    const o = saveObject<V>();
    for (const key of this.keys()) {
      //eslint-disable-next-line @typescript-eslint/no-extra-semi
      (o as Record<string, string[]>)[key] = this.getAll(key);
    }
    return o;
  }
}
