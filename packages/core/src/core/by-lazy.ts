export const byLazy = <VALUE, TARGET>(factory: (self: TARGET) => VALUE) => {
  return (target: TARGET, propertyKey: string) => {
    let isSet = false
    let cache: VALUE
    Object.defineProperty(target, propertyKey, {
      get: (): VALUE => {
        if (!isSet) {
          // TODO inject this
          cache = factory()
          isSet = true
        }
        return cache
      },
    })
  }
}

// TODO ThisProvider
