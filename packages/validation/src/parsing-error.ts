/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

export const LuftErrorCodes = {
  INVALID_UNION: "INVALID_UNION",
  CUSTOM: "CUSTOM",
  INCOMPATIBLE_TYPE: "INCOMPATIBLE_TYPE",
  MISSING_KEYS: "MISSING_KEYS",
  ADDITIONAL_KEYS: "ADDITIONAL_KEYS",
} as const

export type LuftErrorCodes = typeof LuftErrorCodes[keyof typeof LuftErrorCodes]

type BaseParsingIssues = {
  code: LuftErrorCodes
  path: (string | number)[]
  message: string
}
type UnionParsingIssue = Omit<BaseParsingIssues, "code"> & {
  code: "INVALID_UNION"
  expectedType: string[]
  receivedType: string
}

type IncompatibleTypeParsingIssue = Omit<BaseParsingIssues, "code"> & {
  code: "INCOMPATIBLE_TYPE"
  expectedType: string
  receivedType: string
}

type MissingKeysIssue = Omit<BaseParsingIssues, "code"> & {
  code: "MISSING_KEYS"
  missingKeys: string[]
}

type AdditionalKeysIssue = Omit<BaseParsingIssues, "code"> & {
  code: "ADDITIONAL_KEYS"
  additionalKeys: string[]
}

export type ParsingIssue =
  | BaseParsingIssues
  | UnionParsingIssue
  | IncompatibleTypeParsingIssue
  | MissingKeysIssue
  | AdditionalKeysIssue

export class LuftParsingError extends Error {
  public constructor(public readonly issues: ParsingIssue[], message?: string) {
    super(message)
  }
}
