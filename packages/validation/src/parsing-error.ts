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
type UnionParsingIssue = BaseParsingIssues & {
  code: "INVALID_UNION"
  expectedType: string[]
  receivedType: string
}

type IncompatibleTypeParsingIssue = BaseParsingIssues & {
  code: "INVALID_TYPE"
  expectedType: string
  receivedType: string
}

type IncompatibleValueParsingIssue = BaseParsingIssues & {
  code: "INVALID_VALUE"
  allowedValues: string[]
  receivedValue: string
}
type InvalidLengthParsingIssue = BaseParsingIssues & {
  code: "INVALID_LENGTH"
  maxLen: number
  minLen: number
  actualLen: number
}

type MissingKeysIssue = BaseParsingIssues & {
  code: "MISSING_KEYS"
  missingKeys: string[]
}

type InvalidRangeIssue = BaseParsingIssues & {
  code: "INVALID_RANGE"
  min: number
  max: number
  actual: number
}

type AdditionalKeysIssue = BaseParsingIssues & {
  code: "TO_MANY_KEYS"
  additionalKeys: string[]
}

export type ParsingIssue =
  | BaseParsingIssues
  | UnionParsingIssue
  | IncompatibleTypeParsingIssue
  | MissingKeysIssue
  | AdditionalKeysIssue
  | IncompatibleValueParsingIssue
  | InvalidLengthParsingIssue
  | InvalidRangeIssue

export class LuftParsingError extends Error {
  public constructor(public readonly issues: ParsingIssue[], message?: string) {
    super(message)
  }
}
