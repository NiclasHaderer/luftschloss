/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { saveObject } from "./utils"

const isObject = (value: unknown): value is Record<string, any> => value instanceof Object
const isFunction = (value: unknown): value is Record<string, any> => typeof value === "function"

export const deepCopy = <T>(object: T): T => {
  if (isFunction(object)) return object
  if (!isObject(object)) return object

  const newObject = saveObject() as T
  for (const key of Object.keys(object)) {
    //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-extra-semi
    ;(newObject as Record<string, any>)[key] = deepCopy((object as Record<string, any>)[key])
  }
  return newObject
}
