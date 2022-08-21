/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

export const LuftErrorCodes = {
  INVALID_UNION: "INVALID_UNION",
  MISSING_KEYS: "MISSING_KEYS",
  TO_MANY_KEYS: "TO_MANY_KEYS",
  NOT_UNIQUE: "NOT_UNIQUE",
  INVALID_TYPE: "INVALID_TYPE",
  MULTIPLE_OF: "MULTIPLE_OF",
  INVALID_VALUE: "INVALID_VALUE",
  INVALID_LENGTH: "INVALID_LENGTH",
  INVALID_RANGE: "INVALID_RANGE",
  PARSING_ISSUE: "PARSING_ISSUE",
} as const

export type LuftErrorCodes = typeof LuftErrorCodes[keyof typeof LuftErrorCodes]

type BaseParsingError = {
  code: LuftErrorCodes
  path: (string | number)[]
  message: string
}

export type InvalidTypeError = BaseParsingError & {
  code: "INVALID_TYPE"
  expectedType: string[]
  receivedType: string
}

export type UnionError = BaseParsingError &
  Omit<InvalidTypeError, "code"> & {
    code: "INVALID_UNION"
    errors: BaseParsingError[]
  }

export type NotUniqueError = BaseParsingError & {
  code: "NOT_UNIQUE"
}

export type MultipleOfError = BaseParsingError & {
  code: "MULTIPLE_OF"
  multipleOf: number
}

export type InvalidValueError = BaseParsingError & {
  code: "INVALID_VALUE"
  allowedValues: string[]
  receivedValue: string
}

export type InvalidLengthError = BaseParsingError & {
  code: "INVALID_LENGTH"
  maxLen: number
  minLen: number
  actualLen: number
}

export type MissingKeysError = BaseParsingError & {
  code: "MISSING_KEYS"
  missingKeys: string[]
}

export type InvalidRangeError = BaseParsingError & {
  code: "INVALID_RANGE"
  min: number
  max: number
  actual: number
  minCompare: ">=" | ">"
  maxCompare: "<=" | "<"
}

export type AdditionalKeysError = BaseParsingError & {
  code: "TO_MANY_KEYS"
  additionalKeys: string[]
}

export type StringParsingError = BaseParsingError & {
  code: "PARSING_ISSUE"
  parser: string
}

export type ParsingError =
  | UnionError
  | InvalidTypeError
  | MissingKeysError
  | AdditionalKeysError
  | InvalidValueError
  | InvalidLengthError
  | InvalidRangeError
  | StringParsingError
  | NotUniqueError
  | MultipleOfError

export class LuftParsingError extends Error {
  public constructor(public readonly issues: ParsingError[], message?: string) {
    super(message)
  }
}

export class LuftParsingUsageError extends Error {}
