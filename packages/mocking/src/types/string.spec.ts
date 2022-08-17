import { trimUntilFits } from "./string"

test("Add random string until it fits", () => {
  const stringToReturn = "Hell   "
  const min = 5
  const result = trimUntilFits(stringToReturn, min)
  expect(result.length).toBe(5)
  expect(result.startsWith("Hell")).toBe(true)
})
