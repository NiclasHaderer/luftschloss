import { LuftParsingError } from "../parsing-error"
import { LuftNumber } from "./number"
import { LuftRecord } from "./record"
import { LuftString } from "./string"

test("Test clone record", () => {
  const validator = new LuftRecord({ key: new LuftString(), value: new LuftNumber() })
  expect(validator.clone()).not.toBe(validator)
  expect(validator.clone()).toStrictEqual(validator)
})

test("Test valid record", () => {
  const validator = new LuftRecord({ key: new LuftString(), value: new LuftNumber() })
  expect(
    validator.validate({
      hello: 1,
      world: 2,
    })
  ).toEqual({
    hello: 1,
    world: 2,
  })
})

test("Test invalid record", () => {
  const validator = new LuftRecord({ key: new LuftString(), value: new LuftNumber() })
  expect(() =>
    validator.validate({
      hello: "1",
      world: 2,
    })
  ).toThrow(LuftParsingError)
  expect(() => validator.validate("hello")).toThrow(LuftParsingError)
})

test("Test non empty", () => {
  const validator = new LuftRecord({ key: new LuftString(), value: new LuftNumber() })
  expect(() => validator.validate({})).not.toThrow(LuftParsingError)
  expect(() => validator.nonEmpty(true).validate({})).toThrow(LuftParsingError)
})
