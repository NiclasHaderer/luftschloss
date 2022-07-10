/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { getTypeOf } from "../helpers"
import { LuftErrorCodes } from "../parsing-error"
import { InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftInt extends LuftBaseType<number> {
  public readonly supportedTypes = ["number"]
  private _allowNaN = false
  private _roundWith: "floor" | "ceil" | "trunc" | "round" = "trunc"
  private _min = -Infinity
  private _max = Infinity

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

  public min(number: number): LuftInt {
    this._min = number
    return this
  }

  public max(number: number): LuftInt {
    this._min = number
    return this
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    if (typeof data === "number" && (this._allowNaN || !isNaN(data))) {
      if (data < this._min) {
        context.addIssue({
          code: LuftErrorCodes.INVALID_RANGE,
          message: `Number to small. Expected value greater than ${this._min} but got ${data}`,
          path: [...context.path],
          max: this._max,
          min: this._min,
          actual: data,
        })
        return { success: false }
      }
      if (data > this._max) {
        context.addIssue({
          code: LuftErrorCodes.INVALID_RANGE,
          message: `Number to large. Expected value smaller than ${this._max} but got ${data}`,
          path: [...context.path],
          max: this._max,
          min: this._min,
          actual: data,
        })
        return { success: false }
      }
    }

    context.addIssue({
      code: LuftErrorCodes.INVALID_TYPE,
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
