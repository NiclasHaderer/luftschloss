import { LuftDate } from "./date"
import { LuftParsingError } from "../parsing-error"

test("Test correct type", () => {
  const validator = new LuftDate()
  expect(validator.validateSave(new Date()).success).toBe(true)
  expect(validator.validateSave("(new Date())").success).toBe(false)
})

test("Test date range", () => {
  const validator = new LuftDate()
  const date = new Date()

  // Invalid time
  expect(validator.before(date.getTime()).validateSave(date).success).toBe(false)
  expect(validator.after(date.toISOString()).validateSave(date).success).toBe(false)
  expect(validator.beforeEq(date.getTime() - 1).validateSave(date).success).toBe(false)
  expect(validator.afterEq(date.getTime() + 1).validateSave(date).success).toBe(false)

  // Valid time
  expect(validator.beforeEq(date.getTime()).validateSave(date).success).toBe(true)
  expect(validator.afterEq(date).validateSave(date).success).toBe(true)
})

test("Coerce string", () => {
  const validator = new LuftDate()
  const date = new Date()
  const result = validator.coerce(date.toISOString())
  expect(result.getTime()).toBe(date.getTime())

  expect(() => {
    expect(validator.coerce("2022-08-missing-T18:14:45.571Z"))
  }).toThrow(LuftParsingError)
})

test("Coerce number", () => {
  const validator = new LuftDate()
  const date = new Date()
  const result = validator.coerce(date.getTime())
  expect(result.getTime()).toBe(date.getTime())

  expect(() => {
    expect(validator.coerce(NaN))
  }).toThrow(LuftParsingError)

  expect(() => {
    expect(validator.coerce(Infinity))
  }).toThrow(LuftParsingError)
})
