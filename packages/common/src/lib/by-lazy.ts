/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

export const SKIP_CACHE = Symbol("SKIP_CACHE");

export const ByLazy = <VALUE, TARGET extends object = never>(
  factory: (this: TARGET, self: TARGET) => VALUE | [typeof SKIP_CACHE, VALUE]
) => {
  return (target: TARGET, propertyKey: string) => {
    const cacheDataSymbol = Symbol(`CACHE_DATA_${propertyKey}`);
    const cacheNotSetDataSymbol = Symbol(`CACHE_NOT_SET_${propertyKey}`);
    // Set the cache symbols on the prototype to improve js object optimization
    (target as any)[cacheDataSymbol] = cacheNotSetDataSymbol;

    Object.defineProperty(target, propertyKey, {
      get(): VALUE {
        const isSet = (): boolean => this[cacheDataSymbol] !== cacheNotSetDataSymbol;
        const getValue = (): VALUE => this[cacheDataSymbol];
        const setValue = (): VALUE => {
          const value = factory.apply(this, [this as TARGET]);
          // Do not cache the value, but skip it
          if (Array.isArray(value) && value[0] === SKIP_CACHE) {
            // Still return the returned value of the factory, just don't save it for later
            return value[1];
          } else {
            // Save the value for later
            this[cacheDataSymbol] = value;
            return value as VALUE;
          }
        };

        if (!isSet()) return setValue();
        return getValue();
      },
    });
  };
};
