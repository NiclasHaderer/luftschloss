import { LuftString } from "./string"
import { SuccessfulParsingResult, UnsuccessfulParsingResult } from "./base-type"
import { InvalidLengthError, LuftErrorCodes } from "../parsing-error"

test("Test valid types", () => {
  const validator = new LuftString()
  expect(validator.validateSave("").success).toBe(true)
  expect(validator.validateSave("hello").success).toBe(true)
})

test("Test trim types", () => {
  const validator = new LuftString()
  const trimValidator = validator.trim(true)
  const trimmedResult = trimValidator.coerceSave("    fd      ")
  expect(trimmedResult.success).toBe(true)
  expect((trimmedResult as SuccessfulParsingResult<string>).data).toBe("fd")
  const untrimmedResult = validator.coerceSave("    fd      ")
  expect(untrimmedResult.success).toBe(true)
  expect((untrimmedResult as SuccessfulParsingResult<string>).data).toBe("    fd      ")
})

test("Test max length", () => {
  const validator = new LuftString().max(10)
  expect(validator.validateSave("0123456789").success).toBe(true)
  const unsuccessfulResult = validator.validateSave("0123456789-")
  expect(unsuccessfulResult.success).toBe(false)
  expect((unsuccessfulResult as UnsuccessfulParsingResult).issues.length).toBe(1)
  expect((unsuccessfulResult as UnsuccessfulParsingResult).issues[0].code).toBe(LuftErrorCodes.INVALID_LENGTH)
  expect(((unsuccessfulResult as UnsuccessfulParsingResult).issues[0] as InvalidLengthError).minLen).toBe(-Infinity)
  expect(((unsuccessfulResult as UnsuccessfulParsingResult).issues[0] as InvalidLengthError).maxLen).toBe(10)
  expect(((unsuccessfulResult as UnsuccessfulParsingResult).issues[0] as InvalidLengthError).actualLen).toBe(11)
})

test("Test min length", () => {
  const validator = new LuftString().min(2).trim(true)
  expect(validator.validateSave("123").success).toBe(true)
  const unsuccessfulResult = validator.coerceSave("1  ")
  expect(unsuccessfulResult.success).toBe(false)
  expect((unsuccessfulResult as UnsuccessfulParsingResult).issues.length).toBe(1)
  expect((unsuccessfulResult as UnsuccessfulParsingResult).issues[0].code).toBe(LuftErrorCodes.INVALID_LENGTH)
  expect(((unsuccessfulResult as UnsuccessfulParsingResult).issues[0] as InvalidLengthError).minLen).toBe(2)
  expect(((unsuccessfulResult as UnsuccessfulParsingResult).issues[0] as InvalidLengthError).maxLen).toBe(Infinity)
  expect(((unsuccessfulResult as UnsuccessfulParsingResult).issues[0] as InvalidLengthError).actualLen).toBe(1)
})

test("Test invalid type", () => {
  const validator = new LuftString()
  expect(validator.validateSave(2).success).toBe(false)
  expect(validator.validateSave(null).success).toBe(false)
  expect(validator.validateSave(undefined).success).toBe(false)
})
