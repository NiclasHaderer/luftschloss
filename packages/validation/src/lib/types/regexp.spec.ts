import { LuftRegexp } from "./regexp"

test("Test regex", () => {
  const validator = new LuftRegexp({ regex: /^\d$/ })
  expect(validator.validateSave("3").success).toBe(true)
  expect(validator.coerceSave("33").success).toBe(false)
})

test("Clone validator", () => {
  const validator = new LuftRegexp({ regex: /^\d$/ })
  const clone = validator.clone()
  expect(clone).toBeInstanceOf(LuftRegexp)
  expect(clone.schema).toEqual(validator.schema)
})
