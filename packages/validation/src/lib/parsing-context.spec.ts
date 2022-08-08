import { ParsingContext } from "./parsing-context"
import { LuftErrorCodes } from "./parsing-error"

test("Adding new issue works", () => {
  const context = new ParsingContext()
  expect(context.hasIssues).toBe(false)
  context.addIssue({ code: LuftErrorCodes.PARSING_ISSUE, path: [], message: "test", parser: "none" })
  expect(context.hasIssues).toBe(true)
  expect(context.issues.length).toBe(1)
  expect(context.issues[0]).toEqual({ code: LuftErrorCodes.PARSING_ISSUE, path: [], message: "test", parser: "none" })
})

test("Clone issues works", () => {
  const context = new ParsingContext().stepInto("hello", "world", 1)

  expect(context.hasIssues).toBe(false)
  context.addIssue({ code: LuftErrorCodes.PARSING_ISSUE, path: [], message: "test", parser: "none" })
  const clonedIssue = context.clone()
  expect(clonedIssue).toStrictEqual(context)
})

test("Clone empty issues works", () => {
  const context = new ParsingContext().stepInto("hello", "world", 1)
  expect(context.hasIssues).toBe(false)
  context.addIssue({ code: LuftErrorCodes.PARSING_ISSUE, path: [], message: "test", parser: "none" })
  const clonedIssue = context.cloneEmpty()
  expect(clonedIssue).toBeInstanceOf(ParsingContext)
  expect(clonedIssue.path).toEqual(["hello", "world", 1])
})

test("Step in and step out work", () => {
  const context = new ParsingContext()
  expect(context.hasIssues).toBe(false)
  expect(context.path).toEqual([])
  context.stepInto("hello", "world", 1)
  expect(context.path).toEqual(["hello", "world", 1])
  context.stepOut()
  expect(context.path).toEqual(["hello", "world"])
  context.stepOut()
  expect(context.path).toEqual(["hello"])
  context.stepOut()
  expect(context.path).toEqual([])
})
