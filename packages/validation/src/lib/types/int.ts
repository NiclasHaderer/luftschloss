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

  constructor(
    public override readonly schema: {
      min: number
      max: number
      allowNan: boolean
      roundWith: "floor" | "ceil" | "trunc" | "round"
    }
  ) {
    super()
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    if (typeof data === "string") {
      data = parseFloat(data)
    }
    if (typeof data === "number" && data % 1 !== 0) {
      data = Math[this.schema.roundWith](data)
    }

    return this._validate(data, context)
  }

  public roundWith(mode: "floor" | "ceil" | "trunc" | "round"): LuftInt {
    this.schema.roundWith = mode
    return this
  }

  public allowNaN(allow: boolean): LuftInt {
    this.schema.allowNan = allow
    return this
  }

  public min(number: number): LuftInt {
    this.schema.min = number
    return this
  }

  public positive(): LuftInt {
    this.schema.min = 0
    return this
  }

  public nonNegative(): LuftInt {
    this.schema.min = -1
    return this
  }

  public negative(): LuftInt {
    this.schema.max = 0
    return this
  }

  public nonPositive(): LuftInt {
    this.schema.max = 1
    return this
  }

  public max(number: number): LuftInt {
    this.schema.min = number
    return this
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    if (typeof data === "number" && (this.schema.allowNan || !isNaN(data))) {
      if (data < this.schema.min) {
        context.addIssue({
          code: LuftErrorCodes.INVALID_RANGE,
          message: `Number to small. Expected value greater than ${this.schema.min} but got ${data}`,
          path: [...context.path],
          max: this.schema.max,
          min: this.schema.min,
          actual: data,
        })
        return { success: false }
      }
      if (data > this.schema.max) {
        context.addIssue({
          code: LuftErrorCodes.INVALID_RANGE,
          message: `Number to large. Expected value smaller than ${this.schema.max} but got ${data}`,
          path: [...context.path],
          max: this.schema.max,
          min: this.schema.min,
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
