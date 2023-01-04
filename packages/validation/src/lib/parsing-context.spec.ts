import { ParsingContext } from "./parsing-context";
import { LuftErrorCodes } from "./validation-error";

test("LuftParsingContext: add new issue", () => {
  const context = new ParsingContext("validate");
  expect(context.hasIssues).toBe(false);
  context.addIssue({ code: LuftErrorCodes.PARSING_ISSUE, path: [], message: "test", parser: "none" });
  expect(context.hasIssues).toBe(true);
  expect(context.issues.length).toBe(1);
  expect(context.issues[0]).toEqual({ code: LuftErrorCodes.PARSING_ISSUE, path: [], message: "test", parser: "none" });
});

test("LuftParsingContext: clone", () => {
  const context = new ParsingContext("coerce").stepInto("hello", "world", 1);

  expect(context.hasIssues).toBe(false);
  context.addIssue({ code: LuftErrorCodes.PARSING_ISSUE, path: [], message: "test", parser: "none" });
  const clonedIssue = context.clone();
  expect(clonedIssue).toStrictEqual(context);
});

test("LuftParsingContext: clone empty", () => {
  const context = new ParsingContext("validate").stepInto("hello", "world", 1);
  expect(context.hasIssues).toBe(false);
  context.addIssue({ code: LuftErrorCodes.PARSING_ISSUE, path: [], message: "test", parser: "none" });
  const clonedIssue = context.cloneEmpty();
  expect(clonedIssue).toBeInstanceOf(ParsingContext);
  expect(clonedIssue.path).toEqual(["hello", "world", 1]);
});

test("LuftParsingContext: step in and out", () => {
  const context = new ParsingContext("coerce");
  expect(context.hasIssues).toBe(false);
  expect(context.path).toEqual([]);
  context.stepInto("hello", "world", 1);
  expect(context.path).toEqual(["hello", "world", 1]);
  context.stepOut();
  expect(context.path).toEqual(["hello", "world"]);
  context.stepOut();
  expect(context.path).toEqual(["hello"]);
  context.stepOut();
  expect(context.path).toEqual([]);
});
