import { containsRegex, DEFAULT_PATH_VALIDATOR_NAME, pathToRegex, stringPathValidator } from "."

test("Contains: default parameter string", () => {
  const path1 = "hello/{world}"
  const path2 = "/hello/{world}"
  const path3 = "/hello/{world}/"
  expect(containsRegex(path1)).toBe(true)
  expect(containsRegex(path2)).toBe(true)
  expect(containsRegex(path3)).toBe(true)
})

test("Contains: explicit parameter string", () => {
  const path1 = "hello/{world:int}"
  const path2 = "/hello/{world:number}"
  const path3 = "/hello/{world:string}/"
  expect(containsRegex(path1)).toBe(true)
  expect(containsRegex(path2)).toBe(true)
  expect(containsRegex(path3)).toBe(true)
})

test("Contains: explicit no variable name", () => {
  const path1 = "hello/{:int}"
  const path2 = "/hello/{:number}"
  const path3 = "/hello/{:string}/"
  const path4 = "/hello/{a:}"
  expect(containsRegex(path1)).toBe(true)
  expect(containsRegex(path2)).toBe(true)
  expect(containsRegex(path3)).toBe(true)
  expect(containsRegex(path4)).toBe(true)
})

test("Contains: invalid", () => {
  const path1 = "/hello/{}/"
  const path2 = "/hello/{:}"
  expect(containsRegex(path1)).toBe(false)
  expect(containsRegex(path2)).toBe(false)
})

test("Convert to path", () => {
  const validators = { string: stringPathValidator(), [DEFAULT_PATH_VALIDATOR_NAME]: stringPathValidator() }
  const pathRegex1 = pathToRegex("/hello/{a:string}", validators)
  const pathRegex2 = pathToRegex("/hello/{:string}/world", validators)
  const pathRegex3 = pathToRegex("/hello/{a}/world", validators)
  const pathRegex4 = pathToRegex("/hello/{a:}/world", validators)
  expect(pathRegex1).toEqual(/^\/hello\/(?<a>[^/]+)\/$/i)
  expect(pathRegex2).toEqual(/^\/hello\/(?:[^/]+)\/world\/$/i)
  expect(pathRegex3).toEqual(/^\/hello\/(?<a>[^/]+)\/world\/$/i)
  expect(pathRegex4).toEqual(/^\/hello\/(?<a>[^/]+)\/world\/$/i)
})
