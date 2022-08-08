import { LuftAny } from "./any"

test("Test if different types are allowed for the any type", () => {
  const validator = new LuftAny()
  let parsingSucceeded: boolean
  parsingSucceeded = validator.validateSave("hello").success
  expect(parsingSucceeded).toBe(true)
  parsingSucceeded = validator.validateSave(2).success
  expect(parsingSucceeded).toBe(true)
  parsingSucceeded = validator.validateSave(null).success
  expect(parsingSucceeded).toBe(true)
  parsingSucceeded = validator.validateSave(undefined).success
  expect(parsingSucceeded).toBe(true)

  let coercionSucceeded: boolean
  coercionSucceeded = validator.coerceSave("hello").success
  expect(coercionSucceeded).toBe(true)
  coercionSucceeded = validator.coerceSave(2).success
  expect(coercionSucceeded).toBe(true)
  coercionSucceeded = validator.coerceSave(null).success
  expect(coercionSucceeded).toBe(true)
  coercionSucceeded = validator.coerceSave(undefined).success
  expect(coercionSucceeded).toBe(true)
})

test("Test any schema clone", () => {
  const validator = new LuftAny()
  expect(validator).not.toBe(validator.clone())
  expect(validator.clone()).toStrictEqual(validator)
})
