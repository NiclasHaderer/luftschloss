import { createInvalidTypeIssue } from "../helpers"
import { LuftErrorCodes, LuftParsingUsageError, UnionError } from "../parsing-error"
import {
  LuftNull,
  LuftType,
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
  let validator: LuftType = new LuftString()
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
  expect(validator.default("hello")).not.toBe(validator)
  expect(validator.default("hello").schema).toStrictEqual(validator.schema)
  expect(validator.default("hello").validationStorage).not.toBe(validator.validationStorage)
  expect(validator.default("hello").validationStorage).toStrictEqual({
    ...validator.default("").validationStorage,
    defaultValue: {
      isSet: true,
      value: "hello",
    },
  })

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
  let newValidator = validator.beforeValidate(value => ({ success: true, data: value }))
  expect(validator).not.toBe(newValidator)
  newValidator = validator.beforeCoerce(value => ({ success: true, data: value }))
  expect(validator).not.toBe(newValidator)
  newValidator = validator.afterValidate(value => ({ success: true, data: value }))
  expect(validator).not.toBe(newValidator)
  newValidator = validator.afterCoerce(value => ({ success: true, data: value }))
  expect(validator).not.toBe(newValidator)
  newValidator = validator.beforeHook(value => ({ success: true, data: value }))
  expect(validator).not.toBe(newValidator)
  newValidator = validator.afterHook(value => ({ success: true, data: value }))
  expect(validator).not.toBe(newValidator)
})

test("Test or", () => {
  const validator = new LuftString()
  expect(validator.validateSave(null).success).toBe(false)
  expect(validator.or(new LuftNull()).validateSave(null).success).toBe(true)
})

test("Test before validate hook", () => {
  const alwaysFalse = new LuftString().beforeValidate((value, context) => {
    context.addIssue(createInvalidTypeIssue(value, ["string"], context))
    return { success: false }
  })
  expect(alwaysFalse.validateSave("hello").success).toBe(false)

  const addWorld = new LuftString().beforeValidate((value, context) => {
    return { success: true, data: value + " world" }
  })
  expect(addWorld.clone().validate("hello")).toBe("hello world")
  expect(addWorld.clone().coerce("hello")).toBe("hello")
})

test("Test before coerce hook", () => {
  const alwaysFalse = new LuftString().beforeCoerce((value, context) => {
    context.addIssue(createInvalidTypeIssue(value, ["string"], context))
    return { success: false }
  })
  expect(alwaysFalse.coerceSave("hello").success).toBe(false)

  const addWorld = new LuftString().beforeCoerce((value, context) => {
    return { success: true, data: value + " world" }
  })
  expect(addWorld.coerce("hello")).toBe("hello world")
  expect(addWorld.validate("hello")).toBe("hello")
})

test("Test invalid hooks", () => {
  const invalidFalse = new LuftString().beforeValidate((value, context) => {
    return { success: false }
  })
  expect(() => invalidFalse.validate("hello")).toThrow(LuftParsingUsageError)

  const invalidTrue = new LuftString().beforeValidate((value, context) => {
    context.addIssue(createInvalidTypeIssue(value, ["string"], context))
    return { success: true, data: value }
  })
  expect(() => invalidTrue.validate("hello")).toThrow(LuftParsingUsageError)
})

test("Test deprecated", () => {
  const validator = new LuftString().deprecated(true)
  let loggedValue

  // Mock console to get the error message printed to the console
  const oldLog = global.console.log
  global.console.log = (...args: any[]) => {
    loggedValue = args
  }
  expect(validator.validateSave("hello").success).toBe(true)
  expect(loggedValue).toStrictEqual(["Usage of deprecated type undefined at", []])
  global.console.log = oldLog
})
