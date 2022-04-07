/* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return */

export const ByLazy = <VALUE, TARGET = never>(factory: (self: TARGET) => VALUE) => {
  return (target: TARGET, propertyKey: string) => {
    const cacheDataSymbol = Symbol("cache_data")
    const cacheSetSymbol = Symbol("cache_set")

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
