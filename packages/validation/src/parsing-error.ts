/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

export const LuftErrorCodes = {
  INVALID_UNION: "INVALID_UNION",
  CUSTOM: "CUSTOM",
} as const

export type LuftErrorCodes = typeof LuftErrorCodes[keyof typeof LuftErrorCodes]

type BaseParsingIssues = { code: LuftErrorCodes; path: (string | number)[]; message: string }
type UnionParsingIssue = Omit<BaseParsingIssues, "code"> & {
  code: "INVALID_UNION"
  expectedType: string[]
  receivedType: string
}
export type ParsingIssue = BaseParsingIssues | UnionParsingIssue

export class LuftParsingError extends Error {
  public constructor(public readonly issues: ParsingIssue[], message?: string) {
    super(message)
  }
}
