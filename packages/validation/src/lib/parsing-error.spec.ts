import { LuftErrorCodes, LuftParsingError } from "./parsing-error"

test("Create new parsing error", () => {
  const error = new LuftParsingError([], "test")
  expect(error.issues).toEqual([])
  const error1 = new LuftParsingError(
    [{ code: LuftErrorCodes.PARSING_ISSUE, parser: "no", message: "parsing did not work", path: ["no", "path"] }],
    "test"
  )
  expect(error1.issues).toEqual([
    { code: LuftErrorCodes.PARSING_ISSUE, parser: "no", message: "parsing did not work", path: ["no", "path"] },
  ])
  expect(error1.message).toEqual("test")
})
