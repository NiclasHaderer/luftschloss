import { LuftNumber } from "./number"
import { LuftTuple } from "./tuple"

test("Test tuple clone", () => {
  const validator = new LuftTuple({ types: [new LuftNumber(), new LuftNumber()] })
  const clone = validator.clone()
  expect(clone).not.toBe(validator)
  expect(clone).toStrictEqual(validator)
})
