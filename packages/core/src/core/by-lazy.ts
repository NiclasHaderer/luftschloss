export const ByLazy = <VALUE, TARGET>(factory: (self: TARGET) => VALUE) => {
  return (target: TARGET, propertyKey: string) => {
    let isSet = false
    let cache: VALUE
    Object.defineProperty(target, propertyKey, {
      get(): VALUE {
        if (!isSet) {
          cache = factory(this as TARGET)
          isSet = true
        }
        return cache
      },
    })
  }
}
