import { LuftObject } from "./object"
import { LuftString } from "./string"
import { LuftNumber } from "./number"
import { UnsuccessfulParsingResult } from "./base-type"
import { AdditionalKeysError, LuftErrorCodes, MissingKeysError } from "../parsing-error"

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
