import { LuftRegexp } from "./regexp"

test("Test regex", () => {
  const validator = new LuftRegexp({ regex: /^\d$/ })
  expect(validator.validateSave("3").success).toBe(true)
  expect(validator.coerceSave("33").success).toBe(false)
})

test("Test regex coerce", () => {
  const validator = new LuftRegexp({ regex: /^\d$/ })
  expect(validator.coerceSave("  3   ").success).toBe(false)
  expect(validator.trim(true).coerceSave("D").success).toBe(false)
  expect(validator.trim(true).coerce("  3   ")).toBe("3")
})

test("Clone validator", () => {
  const validator = new LuftRegexp({ regex: /^\d$/ })
  const clone = validator.clone()
  expect(clone).toStrictEqual(validator)
  expect(clone).not.toBe(validator)
  expect(clone.schema).toEqual(validator.schema)
})

test("Regex supported type modification not possible", () => {
  const validator = new LuftRegexp({ regex: /^\d$/ })
  expect(() => (validator.supportedTypes = ["asdf"])).toThrow(new Error("Setting of supported types is not allowed"))
})
