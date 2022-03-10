export const normalizePath = (url: string): string => {
  url = `/${url}/`
  // Replace // with /
  return url.replaceAll("//", "/")
}
