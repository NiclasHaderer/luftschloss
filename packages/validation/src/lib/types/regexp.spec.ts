import { LuftRegex } from "./regexp";

test("RegexType: regex", () => {
  const validator = new LuftRegex({ regex: /^\d$/ });
  expect(validator.validateSave("3").success).toBe(true);
  expect(validator.coerceSave("33").success).toBe(false);
});

test("RegexType: coerce", () => {
  const validator = new LuftRegex({ regex: /^\d$/ });
  expect(validator.coerceSave("  3   ").success).toBe(false);
  expect(validator.trim(true).coerceSave("D").success).toBe(false);
  expect(validator.trim(true).coerce("  3   ")).toBe("3");
});

test("RegexType: clone", () => {
  const validator = new LuftRegex({ regex: /^\d$/ });
  const clone = validator.clone();
  expect(clone).toStrictEqual(validator);
  expect(clone).not.toBe(validator);
  expect(clone.schema).toEqual(validator.schema);
});
