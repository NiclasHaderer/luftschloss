/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

export const LuftErrorCodes = {
  INVALID_UNION: "INVALID_UNION",
  CUSTOM: "CUSTOM",
  MISSING_KEYS: "MISSING_KEYS",
  TO_MANY_KEYS: "TO_MANY_KEYS",
  INVALID_TYPE: "INVALID_TYPE",
  INVALID_VALUE: "INVALID_VALUE",
  INVALID_LENGTH: "INVALID_LENGTH",
  INVALID_RANGE: "INVALID_RANGE",
} as const

export type LuftErrorCodes = typeof LuftErrorCodes[keyof typeof LuftErrorCodes]

type BaseParsingIssues = {
  code: LuftErrorCodes
  path: (string | number)[]
  message: string
}
export type UnionParsingIssue = BaseParsingIssues & {
  code: "INVALID_UNION"
  expectedType: string[]
  receivedType: string
}

export type InvalidTypeParsingIssue = BaseParsingIssues & {
  code: "INVALID_TYPE"
  expectedType: string[]
  receivedType: string
}

export type InvalidValueParsingIssue = BaseParsingIssues & {
  code: "INVALID_VALUE"
  allowedValues: string[]
  receivedValue: string
}
export type InvalidLengthParsingIssue = BaseParsingIssues & {
  code: "INVALID_LENGTH"
  maxLen: number
  minLen: number
  actualLen: number
}

export type MissingKeysIssue = BaseParsingIssues & {
  code: "MISSING_KEYS"
  missingKeys: string[]
}

export type InvalidRangeIssue = BaseParsingIssues & {
  code: "INVALID_RANGE"
  min: number
  max: number
  actual: number
}

export type AdditionalKeysIssue = BaseParsingIssues & {
  code: "TO_MANY_KEYS"
  additionalKeys: string[]
}

export type ParsingIssue =
  | UnionParsingIssue
  | InvalidTypeParsingIssue
  | MissingKeysIssue
  | AdditionalKeysIssue
  | InvalidValueParsingIssue
  | InvalidLengthParsingIssue
  | InvalidRangeIssue

export class LuftParsingError extends Error {
  public constructor(public readonly issues: ParsingIssue[], message?: string) {
    super(message)
  }
}
