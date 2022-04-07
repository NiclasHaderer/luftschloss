/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { deepCopy } from "./deep-copy"

const isObject = (value: unknown): value is Record<string, any> => value instanceof Object

const defaultExecutor = <T extends Record<string, any>>(partial: T, defaults: T) => {
  for (const key of Object.keys(defaults)) {
    // Key is not filled, so fill it with a default value, can be primitive or object
    if (partial[key] === undefined) {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-extra-semi
      ;(partial as Record<string, any>)[key] = deepCopy(defaults[key])
    }
    // If the not undefined value is an object fill the child object with defaults as well
    else if (isObject(partial[key]) && isObject(defaults[key])) {
      defaultExecutor(partial[key], defaults[key])
    }
  }
  return defaults
}

export const withDefaults = <T extends Record<string, any>>(partial: Partial<T>, defaults: T): T => {
  partial = deepCopy(partial)
  return defaultExecutor(partial as T, defaults)
}
