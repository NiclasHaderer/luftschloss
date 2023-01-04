/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

const FUNC_CACHE_KEY = Symbol("FUNC_CACHE_KEY");

export const Cache = (maxSize = 100) => {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineProperty(target, FUNC_CACHE_KEY, {
      writable: true,
    });
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      let cache: Map<string, any> = (this as any)[FUNC_CACHE_KEY];
      if (!cache) {
        cache = new Map();
        (this as any)[FUNC_CACHE_KEY] = cache;
      }
      const cacheKey = JSON.stringify(args);
      if (!cache.has(cacheKey)) {
        if (cache.size >= maxSize) {
          cache.delete(cache.keys().next().value);
        }
        cache.set(cacheKey, originalMethod.apply(this, args));
      }

      return cache.get(cacheKey);
    };
  };
};
