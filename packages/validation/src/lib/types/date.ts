/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { getTypeOf } from "../helpers"
import { LuftErrorCodes } from "../parsing-error"
import { InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftDate extends LuftBaseType<Date> {
  public readonly supportedTypes = ["date", "string", "number"]

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<Date> {
    if (data instanceof Date) {
      return {
        success: true,
        data: data,
      }
    }

    if (typeof data === "number") {
      return {
        success: true,
        data: new Date(data),
      }
    }

    if (typeof data === "string") {
      const parsedDate = Date.parse(data)
      if (isNaN(parsedDate)) return this._validate(data, context)

      return {
        success: true,
        data: new Date(parsedDate),
      }
    }

    return this._validate(data, context)
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<Date> {
    if (data instanceof Date) {
      return {
        success: true,
        data: data,
      }
    }

    context.addIssue({
      code: LuftErrorCodes.INVALID_TYPE,
      message: `Expected type date, but got ${getTypeOf(data)}`,
      path: [...context.path],
      expectedType: "date",
      receivedType: getTypeOf(data),
    })
    return {
      success: false,
    }
  }
}
