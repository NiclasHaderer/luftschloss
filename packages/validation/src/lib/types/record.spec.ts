import { LuftValidationError } from "../validation-error"
import { LuftNumber } from "./number"
import { LuftRecord } from "./record"
import { LuftString } from "./string"

test("RecordType: clone", () => {
  const validator = new LuftRecord({ key: new LuftString(), value: new LuftNumber() })
  expect(validator.clone()).not.toBe(validator)
  expect(validator.clone()).toStrictEqual(validator)
})

test("RecordType: valid record", () => {
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
  expect(
    validator.coerce({
      hello: 1,
      world: 2,
    })
  ).toEqual({
    hello: 1,
    world: 2,
  })
})

test("RecordType: invalid record", () => {
  const validator = new LuftRecord({ key: new LuftString(), value: new LuftNumber().parseString(true) })
  expect(() =>
    validator.validate({
      hello: "1",
      world: 2,
    })
  ).toThrow(LuftValidationError)
  expect(() => validator.validate("hello")).toThrow(LuftValidationError)
  expect(
    validator.coerce({
      hello: "1",
      world: 2,
    })
  ).toEqual({ hello: 1, world: 2 })
})

test("RecordType: non empty", () => {
  const validator = new LuftRecord({ key: new LuftString(), value: new LuftNumber() })
  expect(() => validator.validate({})).not.toThrow(LuftValidationError)
  expect(() => validator.nonEmpty(true).validate({})).toThrow(LuftValidationError)
})

test("RecordType: to many keys", () => {
  const validator = new LuftRecord({ key: new LuftString(), value: new LuftNumber() }).maxProperties(2)
  expect(() => validator.validate({ a: 1, b: 2, c: 3 })).toThrow(LuftValidationError)
  expect(() => validator.validate({ a: 1, b: 2 })).not.toThrow(LuftValidationError)
})

test("RecordType: to few keys", () => {
  const validator = new LuftRecord({ key: new LuftString(), value: new LuftNumber() }).minProperties(2)
  expect(() => validator.validate({ a: 1 })).toThrow(LuftValidationError)
  expect(() => validator.validate({ a: 1, b: 2 })).not.toThrow(LuftValidationError)
})
