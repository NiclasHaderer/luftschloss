import { LuftValidationError } from "../validation-error";
import { LuftLiteral } from "./literal";

test("LiteralType: successful literal validation", () => {
  const schemaValidator = new LuftLiteral({ types: ["hello", "world", true, 2] });
  expect(schemaValidator.validateSave("hello").success).toBe(true);
  expect(schemaValidator.validateSave("world").success).toBe(true);
  expect(schemaValidator.coerceSave("world").success).toBe(true);
  expect(schemaValidator.validateSave(true).success).toBe(true);
  expect(schemaValidator.validateSave(2).success).toBe(true);
  expect(schemaValidator.validateSave(3).success).toBe(false);
  expect(schemaValidator.validateSave("not-working").success).toBe(false);
  expect(schemaValidator.validateSave(false).success).toBe(false);
  expect(schemaValidator.validateSave({}).success).toBe(false);
  expect(schemaValidator.validateSave([]).success).toBe(false);
});

test("LiteralType: case insensitive match", () => {
  const schemaValidator = new LuftLiteral({ types: ["hello", "world", true, 2] });
  const caseInsensitive = schemaValidator.ignoreCase(true);
  expect(caseInsensitive.validate("Hello")).toBe("Hello");
  expect(caseInsensitive.coerce("Hello")).toBe("hello");
  expect(() => {
    schemaValidator.validate("Hello");
  }).toThrow(LuftValidationError);
});
