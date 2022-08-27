import { trimUntilFits } from "./string"

test("StringMock: add random string until it fits 1", () => {
  const stringToReturn = "Hell   "
  const min = 5
  const result = trimUntilFits(stringToReturn, () => "a", min)
  expect(result.length).toBe(5)
  expect(result.startsWith("Hell")).toBe(true)
})

test("StringMock: add random string until it fits 2", () => {
  const stringToReturn = "Hell   "
  const min = 6
  const result = trimUntilFits(stringToReturn, () => "a", min)
  expect(result.length).toBe(5)
  expect(result.startsWith("Hella")).toBe(true)
})
