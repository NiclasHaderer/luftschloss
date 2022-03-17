export const normalizePath = (url: string): string => {
  url = `/${url}/`
  // Replace // with /
  return url.replaceAll(/\/+/g, "/")
}

/**
 * Escape the special characters in the regex string
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 * @param s The string which should be escaped
 */
export const escapeRegexString = (s: string): string => {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// TODO deep partial
export const fillWithDefaults = <T extends object>(partial: Partial<T>, defaults: T): T => {
  // TODO
  return defaults
}
