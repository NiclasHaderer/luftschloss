/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { isArray } from "@luftschloss/core"
import { InvalidTypeError, LuftErrorCodes } from "./parsing-error"
import { ParsingContext } from "./types/base-type"

export const getTypeOf = (value: unknown) => {
  const type = typeof value
  if (type === "object") {
    if (isArray(value)) return "array" as const
    if (value === null) return "null" as const
    if (type.constructor.name === "Object") return "object" as const
    return type.constructor.name
  }
  if (type === "number") {
    if (isNaN(value as number)) {
      return "NaN" as const
    } else if (value === Infinity) {
      return "Infinity" as const
    } else if (value === -Infinity) {
      return "-Infinity" as const
    } else if ((value as number) % 1 !== 0) {
      return "float" as const
    }
  }
  return type
}

export const createInvalidTypeIssue = (
  data: unknown,
  expectedType: string[],
  context: ParsingContext,
  message?: string
): InvalidTypeError => {
  const receivedType = getTypeOf(data)
  return {
    message: message ?? `Expected ${expectedType.join(", ")}, but got ${receivedType}`,
    code: LuftErrorCodes.INVALID_TYPE,
    path: [...context.path],
    expectedType: expectedType,
    receivedType: receivedType,
  }
}
