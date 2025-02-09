import { LuftBool } from "./bool";
import { LuftValidationError } from "../validation-error";

test("BoolType: valid bool types", () => {
  const validator = new LuftBool();
  expect(validator.validate(true)).toBe(true);
  expect(validator.validate(false)).toBe(false);

  expect(() => validator.coerce("true")).toThrowError(LuftValidationError);
  expect(() => validator.coerce("false")).toThrowError(LuftValidationError);
});

test("BoolType: parse bool string", () => {
  const validator = new LuftBool().parseString(true);
  expect(validator.coerce("true")).toBe(true);
  expect(validator.coerce("tRue")).toBe(true);
  expect(validator.coerce("false")).toBe(false);
  expect(validator.coerce("False")).toBe(false);
  expect(() => validator.coerce("Falsee")).toThrowError(LuftValidationError);

  // Test with numbers
  expect(validator.parseNumbers(true).coerce("1")).toBe(true);
  expect(validator.parseNumbers(true).coerce("0")).toBe(false);
  expect(() => new LuftBool().parseNumbers(true).coerce("0")).toThrowError(LuftValidationError);
  expect(() => new LuftBool().parseNumbers(true).coerce("1")).toThrowError(LuftValidationError);
});

test("BoolType: clone", () => {
  const validator = new LuftBool();
  expect(validator).not.toBe(validator.clone());
  expect(validator.schema).not.toBe(validator.clone().schema);
  expect(validator).toStrictEqual(validator.clone());
});
