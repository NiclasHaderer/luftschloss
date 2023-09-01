import { LuftString } from "./string";
import { SuccessfulParsingResult, UnsuccessfulParsingResult } from "./base-types";
import { InvalidLengthError, InvalidTypeError, LuftErrorCodes } from "../validation-error";

test("StringType: validation", () => {
  const validator = new LuftString();
  expect(validator.validateSave("").success).toBe(true);
  expect(validator.validateSave("hello").success).toBe(true);
  expect(validator.validateSave(undefined).success).toBe(false);
  expect(validator.validateSave({}).success).toBe(false);
  expect(validator.validateSave(37).success).toBe(false);
  expect(validator.validateSave(Infinity).success).toBe(false);
  expect(validator.coerceSave(undefined).success).toBe(false);
  expect(validator.coerceSave({}).success).toBe(false);
  expect(validator.coerceSave(37).success).toBe(false);
  expect(validator.coerceSave(Infinity).success).toBe(false);
});

test("StringType: trim", () => {
  const validator = new LuftString();
  const trimValidator = validator.trim(true);
  const trimmedResult = trimValidator.coerceSave("    fd      ");
  expect(trimmedResult.success).toBe(true);
  expect((trimmedResult as SuccessfulParsingResult<string>).data).toBe("fd");
  const untrimmedResult = validator.coerceSave("    fd      ");
  expect(untrimmedResult.success).toBe(true);
  expect((untrimmedResult as SuccessfulParsingResult<string>).data).toBe("    fd      ");
});

test("StringType: max length", () => {
  const validator = new LuftString().max(10);
  expect(validator.validateSave("0123456789").success).toBe(true);
  const unsuccessfulResult = validator.validateSave("0123456789-");
  expect(unsuccessfulResult.success).toBe(false);
  expect((unsuccessfulResult as UnsuccessfulParsingResult).issues.length).toBe(1);
  expect((unsuccessfulResult as UnsuccessfulParsingResult).issues[0].code).toBe(LuftErrorCodes.INVALID_LENGTH);
  expect(((unsuccessfulResult as UnsuccessfulParsingResult).issues[0] as InvalidLengthError).minLen).toBe(undefined);
  expect(((unsuccessfulResult as UnsuccessfulParsingResult).issues[0] as InvalidLengthError).maxLen).toBe(10);
  expect(((unsuccessfulResult as UnsuccessfulParsingResult).issues[0] as InvalidLengthError).actualLen).toBe(11);
});

test("StringType: min length", () => {
  const validator = new LuftString().min(2).trim(true);
  expect(validator.validateSave("123").success).toBe(true);
  const unsuccessfulResult = validator.coerceSave("1  ");
  expect(unsuccessfulResult.success).toBe(false);
  expect((unsuccessfulResult as UnsuccessfulParsingResult).issues.length).toBe(1);
  expect((unsuccessfulResult as UnsuccessfulParsingResult).issues[0].code).toBe(LuftErrorCodes.INVALID_LENGTH);
  expect(((unsuccessfulResult as UnsuccessfulParsingResult).issues[0] as InvalidLengthError).minLen).toBe(2);
  expect(((unsuccessfulResult as UnsuccessfulParsingResult).issues[0] as InvalidLengthError).maxLen).toBe(undefined);
  expect(((unsuccessfulResult as UnsuccessfulParsingResult).issues[0] as InvalidLengthError).actualLen).toBe(1);
});

test("StringType: invalid type", () => {
  const validator = new LuftString();
  expect(validator.validateSave(2).success).toBe(false);
  expect(validator.validateSave(null).success).toBe(false);
  expect(validator.validateSave(undefined).success).toBe(false);
  let invalidType = (validator.validateSave(Infinity) as UnsuccessfulParsingResult).issues[0] as InvalidTypeError;
  expect(invalidType.receivedType).toBe("Infinity");
  invalidType = (validator.validateSave(-Infinity) as UnsuccessfulParsingResult).issues[0] as InvalidTypeError;
  expect(invalidType.receivedType).toBe("-Infinity");
  invalidType = (validator.validateSave(NaN) as UnsuccessfulParsingResult).issues[0] as InvalidTypeError;
  expect(invalidType.receivedType).toBe("NaN");
});
