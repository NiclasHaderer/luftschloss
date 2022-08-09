import { LuftParsingError } from "../parsing-error"
import { LuftArray } from "./array"
import { LuftInt } from "./int"
import { LuftString } from "./string"

function* toIterator(data: unknown[]): Iterable<unknown> {
  for (const item of data) {
    yield item
  }
}

test("Test different types", () => {
  const validator = new LuftArray({ type: new LuftString() })
  expect(validator.validateSave([]).success).toBe(true)
  expect(validator.validateSave([1, 2, 3]).success).toBe(false)
  expect(validator.validateSave(["1", "2", "3"]).success).toBe(true)
  expect(validator.validateSave(["1", "2", "3", 4]).success).toBe(false)
  expect(validator.validateSave({}).success).toBe(false)
})

test("Test clone", () => {
  const validator = new LuftArray({ type: new LuftString() })
  expect(validator.clone()).toStrictEqual(validator)
})

test("Test min length", () => {
  const validator = new LuftArray({ type: new LuftInt() }).minLength(2)
  expect(validator.validateSave([]).success).toBe(false)
  expect(validator.validateSave([1]).success).toBe(false)
  expect(validator.validateSave([1, 2]).success).toBe(true)
  expect(validator.validateSave([1, 2, 3]).success).toBe(true)
})

test("Test max length", () => {
  const validator = new LuftArray({ type: new LuftInt() }).maxLength(4)
  expect(validator.validateSave([1, 2, 3]).success).toBe(true)
  expect(validator.validateSave([1, 2, 3, 4]).success).toBe(true)
  expect(validator.validateSave([1, 2, 3, 4, 5]).success).toBe(false)
  expect(validator.validateSave([1, 2, 3, 4, 5, 6]).success).toBe(false)
})

test("Test non-empty", () => {
  const validator = new LuftArray({ type: new LuftInt() }).maxLength(4)
  expect(validator.nonEmpty(true).validateSave([]).success).toBe(false)
  expect(validator.nonEmpty(false).validateSave([]).success).toBe(true)
})

test("Parse csv", () => {
  const validator = new LuftArray({ type: new LuftInt().parseString(true) })
  const data = validator.parseWith("csv").coerce("1, 2, 3, 4")
  expect(data).toEqual([1, 2, 3, 4])
  expect(() => validator.coerce(["1, 2, 3, 4"])).toThrow(LuftParsingError)
  expect(() => validator.coerce("1, 2")).toThrow(LuftParsingError)
})

test("Parse json", () => {
  const validator = new LuftArray({ type: new LuftInt().parseString(true) })
  const data = validator.parseWith("json").coerce("[1,2,3,4]")
  expect(data).toEqual([1, 2, 3, 4])
  expect(() => validator.coerce(["1, 2, 3, 4"])).toThrow(LuftParsingError)
  expect(() => validator.parseWith("json").coerce("no-json")).toThrow(LuftParsingError)
})

test("Coerce iterable", () => {
  const validator = new LuftArray({ type: new LuftInt() })
  expect(() => validator.validate([1, 2, 3].entries())).toThrow(LuftParsingError)
  expect(validator.coerce(toIterator([1, 2, 3]))).toEqual([1, 2, 3])
})
