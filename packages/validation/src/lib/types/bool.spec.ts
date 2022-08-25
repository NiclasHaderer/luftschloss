import { LuftBool } from "./bool"
import { LuftValidationError } from "../validation-error"

test("Test valid bool types", () => {
  const validator = new LuftBool()
  expect(validator.validate(true)).toBe(true)
  expect(validator.validate(false)).toBe(false)

  expect(() => validator.validate("true")).toThrowError(LuftValidationError)
  expect(() => validator.validate("false")).toThrowError(LuftValidationError)
})

test("Test parse bool string", () => {
  const validator = new LuftBool().parseString(true)
  expect(validator.coerce("true")).toBe(true)
  expect(validator.coerce("tRue")).toBe(true)
  expect(validator.coerce("false")).toBe(false)
  expect(validator.coerce("False")).toBe(false)
  expect(() => validator.coerce("Falsee")).toThrowError(LuftValidationError)
})

test("Test clone", () => {
  const validator = new LuftBool()
  expect(validator).not.toBe(validator.clone())
  expect(validator.schema).not.toBe(validator.clone().schema)
  expect(validator).toStrictEqual(validator.clone())
})
