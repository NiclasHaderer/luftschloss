import { LuftInfer, SuccessfulParsingResult } from "./base-type"
import { LuftNumber } from "./number"
import { LuftValidationError } from "../validation-error"

test("Test if correct number is parsed", () => {
  const numberSchema = new LuftNumber()
  const result = numberSchema.validateSave(1)
  expect(result.success).toBe(true)
  expect((result as SuccessfulParsingResult<LuftInfer<LuftNumber>>).data).toBe(1)
})

test("Test invalid type", () => {
  const numberSchema = new LuftNumber()
  const result = numberSchema.validateSave("no-number")
  expect(result.success).toBe(false)
})

test("NaN not accepted", () => {
  const numberSchema = new LuftNumber()
  const result = numberSchema.validateSave(NaN)
  expect(result.success).toBe(false)
})

test("NaN accepted", () => {
  const numberSchema = new LuftNumber().allowNaN(true)
  const result = numberSchema.validateSave(NaN)
  expect(result.success).toBe(true)
  expect((result as SuccessfulParsingResult<LuftInfer<LuftNumber>>).data).toBe(NaN)
})

test("Invalid negative range", () => {
  const numberSchema = new LuftNumber().min(-10).max(10)
  // Invalid numbers
  const result1 = numberSchema.validateSave(-11)
  expect(result1.success).toBe(false)
  const result2 = numberSchema.validateSave(11)
  expect(result2.success).toBe(false)

  // Valid numbers
  const result3 = numberSchema.validateSave(-9)
  expect(result3.success).toBe(true)
  const result4 = numberSchema.validateSave(9)
  expect(result4.success).toBe(true)
})

test("Parse string coercion", () => {
  let numberSchema = new LuftNumber().parseString(true)
  const result1 = numberSchema.coerceSave("9.6")
  expect(result1.success).toBe(true)
  expect((result1 as SuccessfulParsingResult<LuftInfer<LuftNumber>>).data).toBe(9.6)

  const result2 = numberSchema.coerceSave("-9.6")
  expect(result2.success).toBe(true)
  expect((result2 as SuccessfulParsingResult<LuftInfer<LuftNumber>>).data).toBe(-9.6)

  const result3 = numberSchema.coerceSave("no-number")
  expect(result3.success).toBe(false)

  numberSchema = numberSchema.allowNaN(true)

  const result4 = numberSchema.coerceSave("no-number")
  expect(result4.success).toBe(true)
  expect((result4 as SuccessfulParsingResult<LuftInfer<LuftNumber>>).data).toBe(NaN)
})

test("Clone number", () => {
  const numberSchema = new LuftNumber()
  const clone = numberSchema.clone()
  expect(clone).toStrictEqual(numberSchema)
  expect(clone).not.toBe(numberSchema)
  expect(clone.schema).toEqual(numberSchema.schema)
})

test("Number: Multiple of", () => {
  const numberSchema = new LuftNumber().multipleOf(10.1)
  expect(() => numberSchema.validate(2)).toThrow(LuftValidationError)
  expect(numberSchema.validate(10.1)).toBe(10.1)
  expect(numberSchema.validate(20.2)).toBe(20.2)
  expect(numberSchema.validate(-30.3)).toBe(-30.3)
})
