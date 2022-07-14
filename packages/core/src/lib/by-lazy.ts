/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

export const ByLazy = <VALUE, TARGET extends object = never>(factory: (self: TARGET) => VALUE) => {
  return (target: TARGET, propertyKey: string) => {
    const cacheDataSymbol = Symbol(`CACHE_DATA_${propertyKey}`)
    const cacheSetSymbol = Symbol(`CACHE_SET_${propertyKey}`)

    Object.defineProperty(target, propertyKey, {
      get(): VALUE {
        const isSet = (): boolean => !!this[cacheSetSymbol]
        const setValue = () => {
          this[cacheSetSymbol] = true
          this[cacheDataSymbol] = factory(this as TARGET)
        }

        const getValue = (): VALUE => this[cacheDataSymbol]

        if (!isSet()) setValue()

        return getValue()
      },
    })
  }
}
