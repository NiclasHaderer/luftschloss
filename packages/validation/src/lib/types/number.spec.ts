import { LuftInfer } from "../infer"
import { SuccessfulParsingResult } from "./base-type"
import { LuftNumber } from "./number"

test("Test default schema", () => {
  expect(new LuftNumber().schema).toEqual({
    min: -Infinity,
    max: Infinity,
    allowNan: false,
    minCompare: ">=",
    maxCompare: "<=",
  })
})

test("Test if correct number is parsed", () => {
  const numberSchema = new LuftNumber({
    min: -Infinity,
    max: Infinity,
    allowNan: false,
    minCompare: ">",
    maxCompare: "<",
  })
  const result = numberSchema.validateSave(1)
  expect(result.success).toBe(true)
  expect((result as SuccessfulParsingResult<LuftInfer<LuftNumber>>).data).toBe(1)
})

test("Test invalid type", () => {
  const numberSchema = new LuftNumber({
    min: -Infinity,
    max: Infinity,
    allowNan: false,
    minCompare: ">",
    maxCompare: "<",
  })
  const result = numberSchema.validateSave("no-number")
  expect(result.success).toBe(false)
})

test("NaN not accepted", () => {
  const numberSchema = new LuftNumber({
    min: -Infinity,
    max: Infinity,
    allowNan: false,
    minCompare: ">",
    maxCompare: "<",
  })
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

  // Check 0
  numberSchema.positive()
  expect(numberSchema.validateSave(0).success).toBe(false)
  expect(numberSchema.validateSave(1).success).toBe(true)
  numberSchema.nonNegative()
  expect(numberSchema.validateSave(0).success).toBe(true)
  expect(numberSchema.validateSave(1).success).toBe(true)

  // Reset options
  numberSchema.max(Infinity).min(-Infinity)

  numberSchema.negative()
  expect(numberSchema.validateSave(0).success).toBe(false)
  expect(numberSchema.validateSave(-1).success).toBe(true)
  numberSchema.nonPositive()
  expect(numberSchema.validateSave(0).success).toBe(true)
  expect(numberSchema.validateSave(-1).success).toBe(true)
})

test("Parse string coercion", () => {
  const numberSchema = new LuftNumber()
  const result1 = numberSchema.coerceSave("9.6")
  expect(result1.success).toBe(true)
  expect((result1 as SuccessfulParsingResult<LuftInfer<LuftNumber>>).data).toBe(9.6)

  const result2 = numberSchema.coerceSave("-9.6")
  expect(result2.success).toBe(true)
  expect((result2 as SuccessfulParsingResult<LuftInfer<LuftNumber>>).data).toBe(-9.6)

  const result3 = numberSchema.coerceSave("no-number")
  expect(result3.success).toBe(false)

  numberSchema.allowNaN(true)

  const result4 = numberSchema.coerceSave("no-number")
  expect(result4.success).toBe(true)
  expect((result4 as SuccessfulParsingResult<LuftInfer<LuftNumber>>).data).toBe(NaN)
})

test("Clone number", () => {
  const numberSchema = new LuftNumber()
  const clone = numberSchema.clone()
  expect(clone).toBeInstanceOf(LuftNumber)
  expect(clone.schema).toEqual(numberSchema.schema)
})

test("Use modifiers", () => {
  const numberSchema = new LuftNumber()
  numberSchema.min(-10)
  expect(numberSchema.schema.min).toBe(-10)
  expect(numberSchema.validateSave(-10).success).toBe(false)
  expect(numberSchema.validateSave(-9).success).toBe(true)
  numberSchema.minEq(-10)
  expect(numberSchema.validateSave(-10).success).toBe(true)

  numberSchema.max(10)
  expect(numberSchema.schema.max).toBe(10)
  expect(numberSchema.validateSave(10).success).toBe(false)
  expect(numberSchema.validateSave(9).success).toBe(true)
  numberSchema.maxEq(10)
  expect(numberSchema.validateSave(10).success).toBe(true)

  expect(numberSchema.validateSave(NaN).success).toBe(false)
  numberSchema.allowNaN(true)
  expect(numberSchema.validateSave(NaN).success).toBe(true)

  numberSchema.nonNegative().nonPositive()
  expect(numberSchema.validateSave(-1).success).toBe(false)
  expect(numberSchema.validateSave(0).success).toBe(true)
  expect(numberSchema.validateSave(1).success).toBe(false)
  expect(numberSchema.schema.min).toBe(0)
  expect(numberSchema.schema.max).toBe(0)
})
