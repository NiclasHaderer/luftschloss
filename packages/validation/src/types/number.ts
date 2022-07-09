/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { getTypeOf } from "../helpers"
import { InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftNumber extends LuftBaseType<number> {
  public readonly supportedTypes = ["number"]
  private allowNan = false

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    if (typeof data === "string") {
      const parsedData = parseFloat(data)
      this._validate(parsedData, context)
    }
    return this._validate(data, context)
  }

  public allowNaN(allow: boolean): LuftNumber {
    this.allowNan = allow
    return this
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    if (typeof data === "number" && (this.allowNan || !isNaN(data))) {
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
