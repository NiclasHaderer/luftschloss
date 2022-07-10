/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { getTypeOf } from "../helpers"
import { LuftErrorCodes } from "../parsing-error"
import { InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftNumber extends LuftBaseType<number> {
  public readonly supportedTypes = ["number"]
  private allowNan = false
  private _min = -Infinity
  private _max = Infinity

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

  public min(number: number): LuftNumber {
    this._min = number
    return this
  }

  public max(number: number): LuftNumber {
    this._min = number
    return this
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    if (typeof data === "number" && (this.allowNan || !isNaN(data))) {
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

      return {
        success: true,
        data: data,
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
