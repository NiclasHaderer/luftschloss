/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

export class CaseInsensitiveSet<T> extends Set<T> {
  private sensitiveLookup = new Map<string, string>()

  public constructor(values: ReadonlyArray<T> | null) {
    const transformedValues: T[] | null = values
      ? (values.map(v => {
          if (typeof v === "string") {
            const lowerV = v.toLowerCase()
            this.sensitiveLookup.set(lowerV, v)
            return lowerV
          } else {
            return v
          }
        }) as T[])
      : null

    super(transformedValues)
  }

  public getCorresponding(value: T): T {
    if (typeof value === "string") {
      const lowerValue = value.toLowerCase()
      return this.sensitiveLookup.get(lowerValue) as unknown as T
    }
    return value
  }

  public override add(value: T): this {
    if (typeof value === "string") {
      const lowerV = value.toLowerCase()
      this.sensitiveLookup.set(lowerV, value)
      return super.add(lowerV as unknown as T)
    }

    return super.add(value)
  }

  public override has(value: T): boolean {
    if (typeof value === "string") {
      value = value.toLowerCase() as unknown as T
    }

    return super.has(value)
  }

  public override delete(value: T) {
    if (typeof value === "string") {
      value = value.toLowerCase() as unknown as T
      this.sensitiveLookup.delete(value as unknown as string)
    }
    return super.delete(value)
  }

  public override *entries(): IterableIterator<[T, T]> {
    for (const entry of super.values()) {
      yield [entry, entry]
    }
  }

  public override keys(): IterableIterator<T> {
    return this.values()
  }

  public override [Symbol.iterator](): IterableIterator<T> {
    return this.values()
  }

  public override forEach<THIS = undefined>(
    callbackfn: (this: THIS, value: T, value2: T, set: Set<T>) => void,
    thisArg?: THIS
  ) {
    for (const value of this.values()) {
      callbackfn.apply(thisArg as THIS, [value, value, this])
    }
  }

  public override *values(): IterableIterator<T> {
    for (const entry of super.values()) {
      if (typeof entry === "string") {
        const lowerE = entry.toLowerCase()
        yield this.sensitiveLookup.get(lowerE) as unknown as T
      } else {
        yield entry
      }
    }
  }
}
