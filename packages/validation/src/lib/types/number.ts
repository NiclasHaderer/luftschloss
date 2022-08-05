/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { createInvalidTypeIssue } from "../helpers"
import { LuftErrorCodes } from "../parsing-error"
import { InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftNumber extends LuftBaseType<number> {
  public readonly supportedTypes = ["number"]
  protected readonly returnType!: number

  constructor(
    public override readonly schema: {
      min: number
      max: number
      allowNan: boolean
      minCompare: ">=" | ">"
      maxCompare: "<=" | "<"
    } = { min: -Infinity, max: Infinity, allowNan: false, minCompare: ">=", maxCompare: "<=" }
  ) {
    super()
  }

  public clone(): LuftNumber {
    return new LuftNumber({ ...this.schema })
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    if (typeof data === "string") {
      data = parseFloat(data)
    }
    return this._validate(data, context)
  }

  public allowNaN(allow: boolean): LuftNumber {
    this.schema.allowNan = allow
    return this
  }

  public min(number: number): LuftNumber {
    this.schema.min = number
    this.schema.minCompare = ">"
    return this
  }

  public minEq(number: number): LuftNumber {
    this.schema.min = number
    this.schema.minCompare = ">="
    return this
  }

  public max(number: number): LuftNumber {
    this.schema.max = number
    this.schema.maxCompare = "<"
    return this
  }

  public maxEq(number: number): LuftNumber {
    this.schema.max = number
    this.schema.maxCompare = "<="
    return this
  }

  public positive(): LuftNumber {
    return this.min(0)
  }

  public nonNegative(): LuftNumber {
    return this.minEq(0)
  }

  public negative(): LuftNumber {
    return this.max(0)
  }

  public nonPositive(): LuftNumber {
    return this.maxEq(0)
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    // Either no number
    if (typeof data !== "number" || (!this.schema.allowNan && isNaN(data))) {
      context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
      return {
        success: false,
      }
    }

    // Don't bother checking if nan is smaller or larger the min/max.
    // If you want greater and smaller to work properly do not allow nan
    if (isNaN(data)) return { success: true, data: NaN }

    // To small
    if (this.isToSmall(data)) {
      context.addIssue({
        code: LuftErrorCodes.INVALID_RANGE,
        message: `Expected value greater than ${this.schema.min} but got ${data}`,
        path: [...context.path],
        max: this.schema.max,
        min: this.schema.min,
        actual: data,
        maxCompare: this.schema.maxCompare,
        minCompare: this.schema.minCompare,
      })
      return { success: false }
    }

    // To large
    if (this.isToLarge(data)) {
      context.addIssue({
        code: LuftErrorCodes.INVALID_RANGE,
        message: `Number to large. Expected value smaller than ${this.schema.max} but got ${data}`,
        path: [...context.path],
        max: this.schema.max,
        min: this.schema.min,
        actual: data,
        maxCompare: this.schema.maxCompare,
        minCompare: this.schema.minCompare,
      })
      return { success: false }
    }

    return {
      success: true,
      data: data,
    }
  }

  protected isToSmall(data: number): boolean {
    if (this.schema.minCompare === ">") {
      return !(data > this.schema.min)
    } else {
      return !(data >= this.schema.min)
    }
  }

  protected isToLarge(data: number): boolean {
    if (this.schema.maxCompare === "<") {
      return !(data < this.schema.max)
    } else {
      return !(data <= this.schema.max)
    }
  }
}
