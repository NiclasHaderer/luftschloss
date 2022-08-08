import { LuftErrorCodes, UnionError } from "../parsing-error"
import {
  LuftBaseType,
  LuftNull,
  LuftUndefined,
  LuftUnion,
  SuccessfulParsingResult,
  UnsuccessfulParsingResult,
} from "./base-type"
import { LuftString } from "./string"

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
  expect(unsuccessfulResult.issues[0].code).toBe(LuftErrorCodes.INVALID_UNION)
  expect((unsuccessfulResult.issues[0] as UnionError).expectedType).toEqual(["null", "string"])
  expect((unsuccessfulResult.issues[0] as UnionError).receivedType).toEqual("T")
})

test("Test optional, nullish, nullable", () => {
  let validator: LuftBaseType<unknown> = new LuftString()
  expect(validator.validateSave(undefined).success).toBe(false)
  validator = validator.optional()
  expect(validator.validateSave(undefined).success).toBe(true)
  expect(validator.validateSave(null).success).toBe(false)
  validator = validator.nullable()
  expect(validator.validateSave(null).success).toBe(true)
  validator = validator.nullish()
  expect(validator.validateSave(null).success).toBe(true)
  expect(validator.validateSave(undefined).success).toBe(true)
  expect(validator.validateSave("").success).toBe(true)
})

test("Test default", () => {
  const validator = new LuftString()
  expect(validator.validateSave(undefined).success).toBe(false)
  expect(validator.validateSave(null).success).toBe(false)
  expect(validator.default("hello").validate(null)).toBe("hello")
  expect(validator.default("hello").validate(undefined)).toBe("hello")
  expect(validator.default("hello").validate("world")).toBe("world")

  expect(validator.coerceSave(undefined).success).toBe(false)
  expect(validator.coerceSave(null).success).toBe(false)
  expect(validator.default("hello").coerce(null)).toBe("hello")
  expect(validator.default("hello").coerce(undefined)).toBe("hello")
  expect(validator.default("hello").coerce("world")).toBe("world")
})

test("Test adding validator", () => {
  const validator = new LuftString()
  const newValidator = validator.beforeValidate(true, value => ({ success: true, data: value }))
  expect(validator).toBe(newValidator)

  let notANewValidator = validator.beforeValidate(false, value => ({ success: true, data: value }))
  expect(validator).not.toBe(notANewValidator)
  notANewValidator = validator.beforeValidate(value => ({ success: true, data: value }))
  expect(validator).not.toBe(notANewValidator)
})
