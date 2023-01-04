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
} as const;

export type LuftErrorCodes = typeof LuftErrorCodes[keyof typeof LuftErrorCodes];

type BaseValidationError = {
  code: LuftErrorCodes;
  path: (string | number)[];
  message: string;
};

export type InvalidTypeError = BaseValidationError & {
  code: "INVALID_TYPE";
  expectedType: string[];
  receivedType: string;
};

export type UnionError = BaseValidationError &
  Omit<InvalidTypeError, "code"> & {
    code: "INVALID_UNION";
    errors: BaseValidationError[];
  };

export type NotUniqueError = BaseValidationError & {
  code: "NOT_UNIQUE";
};

export type MultipleOfError = BaseValidationError & {
  code: "MULTIPLE_OF";
  multipleOf: number;
};

export type InvalidValueError = BaseValidationError & {
  code: "INVALID_VALUE";
  allowedValues: string[];
  receivedValue: string;
};

export type InvalidLengthError = BaseValidationError & {
  code: "INVALID_LENGTH";
  actualLen: number;
} & (
    | {
        maxLen: number | undefined;
        minLen: number;
      }
    | {
        maxLen: number;
        minLen: number | undefined;
      }
  );

export type MissingKeysError = BaseValidationError & {
  code: "MISSING_KEYS";
  missingKeys: string[];
};

export type InvalidRangeError = BaseValidationError & {
  code: "INVALID_RANGE";
  actual: number;
  minCompare: ">=" | ">";
  maxCompare: "<=" | "<";
} & (
    | {
        min: number;
        max: number | undefined;
      }
    | {
        min: number | undefined;
        max: number;
      }
  );

export type AdditionalKeysError = BaseValidationError & {
  code: "TO_MANY_KEYS";
  additionalKeys: string[];
};

export type StringParsingError = BaseValidationError & {
  code: "PARSING_ISSUE";
  parser: string;
};

export type ValidationError =
  | UnionError
  | InvalidTypeError
  | MissingKeysError
  | AdditionalKeysError
  | InvalidValueError
  | InvalidLengthError
  | InvalidRangeError
  | StringParsingError
  | NotUniqueError
  | MultipleOfError;

export class LuftValidationError extends Error {
  public constructor(message: string, public readonly issues: ValidationError[]) {
    super(message);
  }
}

export class LuftValidationUsageError extends Error {}
