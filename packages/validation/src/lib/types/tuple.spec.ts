import { LuftParsingError } from "../parsing-error"
import { LuftNumber } from "./number"
import { LuftRegexp } from "./regexp"
import { LuftString } from "./string"
import { LuftTuple } from "./tuple"

function* toIterator(data: unknown[]): Iterable<unknown> {
  for (const item of data) {
    yield item
  }
}

test("Test tuple clone", () => {
  const validator = new LuftTuple({ types: [new LuftNumber(), new LuftNumber()] })
  const clone = validator.clone()
  expect(clone).not.toBe(validator)
  expect(clone).toStrictEqual(validator)
})

test("Test valid types", () => {
  const validator = new LuftTuple({ types: [new LuftNumber(), new LuftNumber(), new LuftString()] })
  expect(validator.validate([1, 2, "3"])).toEqual([1, 2, "3"])
  const validator2 = new LuftTuple({ types: [new LuftRegexp({ regex: /\d/ }), new LuftNumber(), new LuftString()] })
  expect(validator2.validate(["1", 2, "3"])).toEqual(["1", 2, "3"])
})

test("Test invalid types", () => {
  const validator = new LuftTuple({ types: [new LuftNumber(), new LuftNumber(), new LuftString()] })
  expect(() => validator.validate([1, "2", "3"])).toThrow(LuftParsingError)
  expect(() => validator.validate([1, "2"])).toThrow(LuftParsingError)
  expect(() => validator.validate(["2", "3"])).toThrow(LuftParsingError)

  const validator2 = new LuftTuple({ types: [new LuftRegexp({ regex: /\d/ }), new LuftNumber(), new LuftString()] })
  expect(() => validator2.validate(["_", 2, "3"])).toThrow(LuftParsingError)
  expect(() => validator2.validate([])).toThrow(LuftParsingError)
  expect(() => validator2.validate("hello")).toThrow(LuftParsingError)
  expect(() => validator2.validate(2)).toThrow(LuftParsingError)
  expect(() => validator2.validate({})).toThrow(LuftParsingError)
})

test("Test coercion", () => {
  const validator = new LuftTuple({ types: [new LuftNumber(), new LuftNumber(), new LuftString()] })
  expect(validator.coerce(toIterator([1, 2, "3"]))).toEqual([1, 2, "3"])
})

test("Test parse csv", () => {
  const validator = new LuftTuple({
    types: [new LuftNumber().parseString(true), new LuftNumber().parseString(true), new LuftString()],
  })
  expect(validator.parseWith("csv").coerce("1,2,3")).toEqual([1, 2, "3"])
  expect(() => validator.coerce("1, 2, 3")).toThrow(LuftParsingError)
})

test("Test parse json", () => {
  const validator = new LuftTuple({ types: [new LuftNumber(), new LuftNumber(), new LuftString()] })
  expect(validator.parseWith("json").coerce('[1,2,"3"]')).toEqual([1, 2, "3"])
  expect(() => validator.parseWith("json").coerce('[1,2,3"]')).toThrow(LuftParsingError)
  expect(() => validator.coerce('[1,2,"3"]')).toThrow(LuftParsingError)
})