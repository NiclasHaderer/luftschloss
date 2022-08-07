import { LuftNull, LuftUndefined, LuftUnion, SuccessfulParsingResult, UnsuccessfulParsingResult } from "./base-type"
import { LuftString } from "./string"
import { InvalidTypeError, LuftErrorCodes } from "../parsing-error"

test("Test undefined", () => {
  const validator = new LuftUndefined()
  expect(validator.validateSave(null).success).toBe(false)
  expect(validator.validateSave("null").success).toBe(false)
  expect(validator.validateSave({}).success).toBe(false)
  expect(validator.coerceSave({}).success).toBe(false)
  expect(validator.coerceSave(undefined).success).toBe(true)
  expect(validator.validateSave(undefined).success).toBe(true)
  expect((validator.coerceSave(undefined) as SuccessfulParsingResult<unknown>).data).toBe(undefined)
})

test("Test null", () => {
  const validator = new LuftNull()
  expect(validator.validateSave(null).success).toBe(true)
  expect(validator.validateSave("null").success).toBe(false)
  expect(validator.validateSave({}).success).toBe(false)
  expect(validator.coerceSave({}).success).toBe(false)
  expect(validator.coerceSave(undefined).success).toBe(false)
  expect(validator.validateSave(undefined).success).toBe(false)
  expect((validator.coerceSave(null) as SuccessfulParsingResult<null>).data).toBe(null)
})

test("Test union", () => {
  const validator = new LuftUnion({ types: [new LuftNull(), new LuftString()] })
  expect(validator.validateSave(null).success).toBe(true)
  expect(validator.validateSave("Hello world").success).toBe(true)

  class T {}

  const unsuccessfulResult = validator.validateSave(new T()) as UnsuccessfulParsingResult
  expect(unsuccessfulResult.success).toBe(false)
  expect(unsuccessfulResult.issues.length).toBe(1)
  expect(unsuccessfulResult.issues[0].code).toBe(LuftErrorCodes.INVALID_TYPE)
  expect((unsuccessfulResult.issues[0] as InvalidTypeError).expectedType).toEqual(["null", "string"])
  expect((unsuccessfulResult.issues[0] as InvalidTypeError).receivedType).toEqual("T")
})
