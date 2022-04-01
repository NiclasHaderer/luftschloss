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

// TODO deep partial
export const fillWithDefaults = <T extends object>(partial: Partial<T>, defaults: T): T => {
  console.log("todo")
  // TODO
  return defaults
}
