/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

export const normalizePath = (url: string): string => {
  url = `/${url}/`
  // Replace // with /
  return url.replaceAll(/\/+/g, "/")
}

/**
 * Escape the special characters in the regex string
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 *
 * @param s The string which should be escaped
 * @returns A regex save string
 */
export const escapeRegexString = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const saveObject = <T extends Record<string, unknown>>(): T => {
  const tmp = {} as T
  Object.freeze(tmp.__proto__)
  return tmp
}

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && !Array.isArray(value)

export const isArray = (value: unknown): value is unknown[] => Array.isArray(value)

export const uniqueList = <T>(list: T[]): T[] => {
  return [...new Set(list)]
}

export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min
