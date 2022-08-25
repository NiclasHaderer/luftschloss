/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { Func } from "./types"
import { isArray, saveObject } from "./utils"

// TODO remove as soon as jest28 is shipped with nx
const isObject = (value: unknown): value is Record<string, unknown> => value instanceof Object
const isFunction = (value: unknown): value is Func => typeof value === "function"
const internalDeepCopy = <T>(object: T): T => {
  if (isFunction(object)) return object
  if (!isObject(object)) return object

  let newObject: T
  if (isArray(object)) {
    newObject = new Array(object.length) as unknown as T
  } else {
    newObject = saveObject() as T
  }

  for (const key of Object.keys(object)) {
    ;(newObject as Record<string, unknown>)[key] = deepCopy((object as Record<string, unknown>)[key])
  }
  return newObject
}

export const deepCopy: <T>(object: T) => T = typeof structuredClone === "undefined" ? internalDeepCopy : structuredClone
