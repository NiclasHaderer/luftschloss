import { AdditionalKeysError, LuftErrorCodes, LuftParsingError, MissingKeysError } from "../parsing-error"
import { UnsuccessfulParsingResult } from "./base-type"
import { LuftNumber } from "./number"
import { LuftObject } from "./object"
import { LuftString } from "./string"

const getObjectValidator = () =>
  new LuftObject({
    type: {
      hello: new LuftString(),
      world: new LuftNumber(),
      nested: new LuftObject({
        type: {
          hello: new LuftString(),
          world: new LuftNumber(),
        },
      }),
    },
  })

test("Validate valid object", () => {
  const validator = getObjectValidator()
  const result = validator.validateSave({ hello: "hello", world: 1, nested: { hello: "nested hello", world: 2 } })
  expect(result.success).toBe(true)
  expect(validator.validateSave("hello").success).toBe(false)
})

test("Test missing keys", () => {
  const validator = getObjectValidator()
  const result = validator.validateSave({ hello: "hello", world: 1, nested: { hello: "nested hello" } })
  expect(result.success).toBe(false)
  const unsuccessful = result as UnsuccessfulParsingResult
  expect(unsuccessful.issues.length).toBe(1)
  expect(unsuccessful.issues[0].code).toBe(LuftErrorCodes.MISSING_KEYS)
  expect((unsuccessful.issues[0] as MissingKeysError).missingKeys).toEqual(["world"])
})

test("Test to many keys", () => {
  const validator = getObjectValidator().ignoreUnknownKeys(false)

  const result = validator.validateSave({
    hello: "hello",
    world: 1,
    toMany: 3,
    nested: { hello: "nested hello", world: 2 },
  })
  expect(result.success).toBe(false)
  const unsuccessful = result as UnsuccessfulParsingResult
  expect(unsuccessful.issues.length).toBe(1)
  expect(unsuccessful.issues[0].code).toBe(LuftErrorCodes.TO_MANY_KEYS)
  expect((unsuccessful.issues[0] as AdditionalKeysError).additionalKeys).toEqual(["toMany"])
})

test("Test stripping unnecessary keys from object", () => {
  const validator = getObjectValidator()
  expect(
    validator.validate({ hello: "hello", world: 1, toMany: 3, nested: { hello: "nested hello", world: 2 } })
  ).toEqual({
    hello: "hello",
    world: 1,
    nested: { hello: "nested hello", world: 2 },
  })
})

test("Test string parsing", () => {
  const validator = getObjectValidator().tryParseString(true)

  expect(
    validator.coerce(`{"hello": "hello","world": 1,"toMany": 3,"nested": { "hello": "nested hello", "world": 2 }}`)
  ).toEqual({
    hello: "hello",
    world: 1,
    nested: { hello: "nested hello", world: 2 },
  })

  expect(() => validator.coerce("not-parsable")).toThrow(LuftParsingError)
})

test("Test missing keys undefined", () => {
  const validator = new LuftObject({
    type: {
      hello: new LuftString().optional(),
      world: new LuftNumber().optional(),
    },
  })

  expect(() => validator.coerce({})).toThrow(LuftParsingError)
  expect(validator.treatMissingKeyAs("undefined").coerce({})).toEqual({ hello: undefined, world: undefined })
})

test("Test omit", () => {
  const validator = getObjectValidator().omit(["world", "hello"])
  const result = validator.validate({ hello: "hello", world: 1, nested: { hello: "nested hello", world: 2 } })
  expect(result).toEqual({
    nested: { hello: "nested hello", world: 2 },
  })
  expect(result.nested.hello).toBe("nested hello")
  expect(result.nested.world).toBe(2)
})

test("Test pick", () => {
  const validator = getObjectValidator().pick(["nested"])
  const result = validator.validate({ hello: "hello", world: 1, nested: { hello: "nested hello", world: 2 } })
  expect(result).toEqual({
    nested: { hello: "nested hello", world: 2 },
  })
  expect(result.nested.hello).toBe("nested hello")
  expect(result.nested.world).toBe(2)
})

test("Test partial", () => {
  const validator = getObjectValidator().partial().treatMissingKeyAs("undefined")
  const result1 = validator.validate({})
  expect(result1).toEqual({})

  const result = validator.validate({ nested: { hello: "nested hello", world: 2 } })
  expect(result).toEqual({ nested: { hello: "nested hello", world: 2 } })
  expect(result?.nested?.hello).toBe("nested hello")
  expect(result?.nested?.world).toBe(2)
})

test("Test merge", () => {
  let validator: LuftObject<any> = getObjectValidator()
  expect(validator.validateSave({}).success).toBe(false)
  validator = validator.partial()
  expect(validator.validateSave({}).success).toBe(true)
  validator = validator.merge({
    newKey: new LuftString(),
  })

  expect(validator.validate({ newKey: "newKey" })).toEqual({ newKey: "newKey" })
})

test("Test extend", () => {
  let validator: LuftObject<any> = getObjectValidator()
  expect(validator.validateSave({}).success).toBe(false)
  validator = validator.partial()
  expect(validator.validateSave({}).success).toBe(true)
  validator = validator.extend(
    new LuftObject({
      type: {
        newKey: new LuftString(),
      },
    })
  )

  expect(validator.validate({ newKey: "newKey" })).toEqual({ newKey: "newKey" })
})

test("Test set name", () => {
  let validator: LuftObject<any> = getObjectValidator()
  expect(validator.schema.name).toBe(undefined)
  validator = validator.named("ImpressiveName")
  expect(validator.schema.name).toBe("ImpressiveName")
  expect(validator.omit(["hello"]).schema.name).toBe(undefined)
  expect(validator.omit(["hello"], "NewName").schema.name).toBe("NewName")
})
