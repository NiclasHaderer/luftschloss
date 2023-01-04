import { LuftInt } from "./int";
import { SuccessfulParsingResult, UnsuccessfulParsingResult } from "./base-type";
import { InvalidTypeError, LuftErrorCodes, LuftValidationError } from "../validation-error";

test("IntType: float", () => {
  const validator = new LuftInt();
  const result = validator.validateSave(1.1) as UnsuccessfulParsingResult;
  expect(result.success).toBe(false);
  expect(result.issues.length).toBe(1);
  expect(result.issues[0].code).toBe(LuftErrorCodes.INVALID_TYPE);
  expect((result.issues[0] as InvalidTypeError).expectedType).toEqual(["int"]);
  expect((result.issues[0] as InvalidTypeError).receivedType).toBe("float");
});

test("IntType: float coerce", () => {
  const validator = new LuftInt().roundWith("round");
  let result = validator.coerceSave(3.5) as SuccessfulParsingResult<number>;
  expect(result.success).toBe(true);
  expect(result.data).toBe(4);

  result = validator.roundWith("floor").coerceSave(3.5) as SuccessfulParsingResult<number>;
  expect(result.success).toBe(true);
  expect(result.data).toBe(3);

  result = validator.parseString(true).coerceSave("3") as SuccessfulParsingResult<number>;
  expect(result.success).toBe(true);
  expect(result.data).toBe(3);

  const noResult = validator.coerceSave("3") as UnsuccessfulParsingResult;
  expect(noResult.success).toBe(false);
  expect(noResult.issues[0].code).toBe(LuftErrorCodes.INVALID_TYPE);
  expect((noResult.issues[0] as InvalidTypeError).receivedType).toBe("string");
  expect((noResult.issues[0] as InvalidTypeError).expectedType).toEqual(["int"]);
});

test("IntType: min", () => {
  let numberSchema = new LuftInt();
  numberSchema = numberSchema.min(-10);
  expect(numberSchema.schema.min).toBe(-10);
  expect(numberSchema.validateSave(-10).success).toBe(false);
  expect(numberSchema.validateSave(-9).success).toBe(true);
  numberSchema = numberSchema.minEq(-10);
  expect(numberSchema.validateSave(-10).success).toBe(true);
});

test("IntType: max", () => {
  let numberSchema = new LuftInt();
  numberSchema = numberSchema.max(10);
  expect(numberSchema.schema.max).toBe(10);
  expect(numberSchema.validateSave(10).success).toBe(false);
  expect(numberSchema.validateSave(9).success).toBe(true);
  numberSchema = numberSchema.maxEq(10);
  expect(numberSchema.validateSave(10).success).toBe(true);
});

test("IntType: NaN", () => {
  let numberSchema = new LuftInt();

  expect(numberSchema.validateSave(NaN).success).toBe(false);
  numberSchema = numberSchema.allowNaN(true);
  expect(numberSchema.validateSave(NaN).success).toBe(true);
});

test("IntType: positive negative", () => {
  let numberSchema = new LuftInt();
  numberSchema = numberSchema.nonNegative().nonPositive();
  expect(numberSchema.validateSave(-1).success).toBe(false);
  expect(numberSchema.validateSave(0).success).toBe(true);
  expect(numberSchema.validateSave(1).success).toBe(false);
  expect(numberSchema.schema.min).toBe(0);
  expect(numberSchema.schema.max).toBe(0);

  // Reset options
  numberSchema = numberSchema.max(undefined).min(undefined);

  // Check 0
  numberSchema = numberSchema.positive();
  expect(numberSchema.validateSave(0).success).toBe(false);
  expect(numberSchema.validateSave(1).success).toBe(true);
  numberSchema = numberSchema.nonNegative();
  expect(numberSchema.validateSave(0).success).toBe(true);
  expect(numberSchema.validateSave(1).success).toBe(true);

  // Reset options
  numberSchema = numberSchema.max(undefined).min(undefined);

  numberSchema = numberSchema.negative();
  expect(numberSchema.validateSave(0).success).toBe(false);
  expect(numberSchema.validateSave(-1).success).toBe(true);
  numberSchema = numberSchema.nonPositive();
  expect(numberSchema.validateSave(0).success).toBe(true);
  expect(numberSchema.validateSave(-1).success).toBe(true);
});

test("IntType:  Multiple of", () => {
  const numberSchema = new LuftInt().multipleOf(10);
  expect(() => numberSchema.validate(2)).toThrow(LuftValidationError);
  expect(numberSchema.validate(10)).toBe(10);
  expect(numberSchema.validate(20)).toBe(20);
  expect(numberSchema.validate(-30)).toBe(-30);
});
