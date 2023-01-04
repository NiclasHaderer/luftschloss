import { LuftErrorCodes, LuftValidationError } from "./validation-error";

test("LuftValidationError: create", () => {
  const error = new LuftValidationError("test", []);
  expect(error.issues).toEqual([]);
  const error1 = new LuftValidationError("test", [
    { code: LuftErrorCodes.PARSING_ISSUE, parser: "no", message: "parsing did not work", path: ["no", "path"] },
  ]);
  expect(error1.issues).toEqual([
    { code: LuftErrorCodes.PARSING_ISSUE, parser: "no", message: "parsing did not work", path: ["no", "path"] },
  ]);
  expect(error1.message).toEqual("test");
});
