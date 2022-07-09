/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { getTypeOf } from "../helpers"
import { InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftInt extends LuftBaseType<number> {
  public readonly supportedTypes = ["number"]
  private _allowNaN = false
  private _roundWith: "floor" | "ceil" | "trunc" | "round" = "trunc"

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    if (typeof data === "string") {
      data = parseFloat(data)
    }
    if (typeof data === "number" && data % 1 !== 0) {
      data = Math[this._roundWith](data)
    }

    return this._validate(data, context)
  }

  public roundWith(mode: "floor" | "ceil" | "trunc" | "round"): LuftInt {
    this._roundWith = mode
    return this
  }

  public allowNaN(allow: boolean): LuftInt {
    this._allowNaN = allow
    return this
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    if (typeof data === "number" && (this._allowNaN || !isNaN(data))) {
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
