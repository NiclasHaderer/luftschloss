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

// TODO move to @luftschloss/core
export const saveObject = <T extends Record<string, unknown>>(): T => {
  const tmp = {} as T
  Object.freeze(tmp.__proto__)
  return tmp
}
