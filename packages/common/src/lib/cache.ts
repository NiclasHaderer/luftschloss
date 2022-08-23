/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

export const Cache = () => {
  const cache = new Map<string, any>()
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      const cacheKey = JSON.stringify(args)
      if (!cache.has(cacheKey)) {
        cache.set(cacheKey, originalMethod.apply(this, args))
      }

      return cache.get(cacheKey)
    }
  }
}
