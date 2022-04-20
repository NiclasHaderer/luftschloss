/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { deepCopy } from "./deep-copy"

const isObject = (value: unknown): value is Record<string, any> => value instanceof Object

const defaultExecutor = <T extends Record<string, any>>(filledPartial: T, defaultValues: T) => {
  for (const key of Object.keys(defaultValues)) {
    // Key is not filled, so fill it with a default value, can be primitive or object
    if (filledPartial[key] === undefined) {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-extra-semi
      ;(filledPartial as Record<string, any>)[key] = deepCopy(defaultValues[key])
    }
    // If the not undefined value is an object fill the child object with defaults as well
    else if (isObject(filledPartial[key]) && isObject(defaultValues[key])) {
      defaultExecutor(filledPartial[key], defaultValues[key])
    }
  }
  return filledPartial
}

export const withDefaults = <T extends Record<string, any>>(partial: Partial<T>, defaults: T): T => {
  partial = deepCopy(partial)
  return defaultExecutor(partial as T, defaults)
}
