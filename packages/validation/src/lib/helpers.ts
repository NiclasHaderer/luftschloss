/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { InvalidTypeError, LuftErrorCodes } from "./validation-error";
import { ParsingContext } from "./parsing-context";
import { getTypeOf } from "@luftschloss/common";

export const createInvalidTypeIssue = (
  data: unknown,
  expectedType: string[],
  context: ParsingContext,
  message?: string
): InvalidTypeError => {
  const receivedType = getTypeOf(data);
  return {
    message: message ?? `Expected ${expectedType.join(", ")}, but got ${receivedType}`,
    code: LuftErrorCodes.INVALID_TYPE,
    path: [...context.path],
    expectedType: expectedType,
    receivedType: receivedType,
  };
};
