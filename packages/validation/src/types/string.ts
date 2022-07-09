/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { getTypeOf } from "../helpers"
import { InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftString extends LuftBaseType<string> {
  public readonly supportedTypes = ["string"]

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    return this._validate(data, context)
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    if (typeof data === "string") {
      return {
        success: true,
        data: data,
      }
    }

    context.addIssue({
      code: "INCOMPATIBLE_TYPE",
      message: `Expected type string, but got ${getTypeOf(data)}`,
      path: [...context.path],
      expectedType: "string",
      receivedType: getTypeOf(data),
    })
    return {
      success: false,
    }
  }
}
