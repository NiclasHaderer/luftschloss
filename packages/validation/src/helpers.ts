/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

export const getTypeOf = (value: unknown) => {
  const type = typeof value
  if (type === "object") {
    if (isArray(value)) return "array" as const
    if (type.constructor.name === "Object") return "object" as const
    return type.constructor.name
  }
  return type
}

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && !Array.isArray(value)

export const isArray = (value: unknown): value is unknown[] => Array.isArray(value)

export const uniqueList = <T>(list: T[]): T[] => {
  return [...new Set(list)]
}

export const toListString = (list: unknown[], separator = ", "): string => {
  return list.reduce((previousValue, currentValue) => {
    //eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    previousValue += `${currentValue}${separator}`
    return previousValue
  }, "") as string
}

export const saveObject = <T extends Record<string, unknown>>(): T => {
  const tmp = {} as T
  Object.freeze(tmp.__proto__)
  return tmp
}
