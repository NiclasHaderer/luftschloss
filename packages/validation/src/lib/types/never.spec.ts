import { LuftNever } from "./never"

test("Test that no value is allowed for the never type", () => {
  const validator = new LuftNever()
  let parsingSucceeded: boolean
  parsingSucceeded = validator.validateSave("hello").success
  expect(parsingSucceeded).toBe(false)
  parsingSucceeded = validator.validateSave(2).success
  expect(parsingSucceeded).toBe(false)
  parsingSucceeded = validator.validateSave(null).success
  expect(parsingSucceeded).toBe(false)
  parsingSucceeded = validator.validateSave(undefined).success
  expect(parsingSucceeded).toBe(false)

  let coercionSucceeded: boolean
  coercionSucceeded = validator.coerceSave("hello").success
  expect(coercionSucceeded).toBe(false)
  coercionSucceeded = validator.coerceSave(2).success
  expect(coercionSucceeded).toBe(false)
  coercionSucceeded = validator.coerceSave(null).success
  expect(coercionSucceeded).toBe(false)
  coercionSucceeded = validator.coerceSave(undefined).success
  expect(coercionSucceeded).toBe(false)
})

test("Test any schema clone", () => {
  const validator = new LuftNever()
  expect(validator).not.toBe(validator.clone())
  expect(validator.clone()).toStrictEqual(validator)
})
