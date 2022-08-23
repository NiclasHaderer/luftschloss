/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { createInvalidTypeIssue } from "../helpers"
import { ParsingContext } from "../parsing-context"
import { LuftErrorCodes } from "../parsing-error"
import { InternalParsingResult, LuftBaseType } from "./base-type"
import { deepCopy } from "@luftschloss/common"

export type LuftNumberSchema = {
  min: number
  max: number
  allowNan: boolean
  minCompare: ">=" | ">"
  maxCompare: "<=" | "<"
  multipleOf: number | undefined
  parseString: boolean
}

export class LuftNumber extends LuftBaseType<number> {
  public readonly supportedTypes = ["number"]

  constructor(
    public override readonly schema: LuftNumberSchema = {
      min: -Infinity,
      max: Infinity,
      allowNan: false,
      minCompare: ">=",
      maxCompare: "<=",
      parseString: false,
      multipleOf: undefined,
    }
  ) {
    super()
  }

  public clone(): LuftNumber {
    return new LuftNumber({ ...this.schema }).replaceValidationStorage(deepCopy(this.validationStorage))
  }

  public parseString(parse: boolean): LuftNumber {
    const newValidator = this.clone()
    newValidator.schema.parseString = parse
    return newValidator
  }

  public allowNaN(allow: boolean): LuftNumber {
    const newValidator = this.clone()
    newValidator.schema.allowNan = allow
    return newValidator
  }

  public min(number: number): LuftNumber {
    const newValidator = this.clone()
    newValidator.schema.min = number
    newValidator.schema.minCompare = ">"
    return newValidator
  }

  public minEq(number: number): LuftNumber {
    const newValidator = this.clone()
    newValidator.schema.min = number
    newValidator.schema.minCompare = ">="
    return newValidator
  }

  public max(number: number): LuftNumber {
    const newValidator = this.clone()
    newValidator.schema.max = number
    newValidator.schema.maxCompare = "<"
    return newValidator
  }

  public maxEq(number: number): LuftNumber {
    const newValidator = this.clone()
    newValidator.schema.max = number
    newValidator.schema.maxCompare = "<="
    return newValidator
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

  public multipleOf(number: number): LuftNumber {
    const newValidator = this.clone()
    newValidator.schema.multipleOf = number
    return newValidator
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    if (typeof data === "string" && this.schema.parseString) {
      data = Number(data)
    }
    return this._validate(data, context)
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    if (typeof data !== "number" || (!this.schema.allowNan && isNaN(data))) {
      context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
      return {
        success: false,
      }
    }

    // Don't bother checking if nan is smaller or larger the min/max.
    // If you want greater and smaller to work properly do not allow nan
    if (isNaN(data)) return { success: true, data: NaN }

    // Check for multipleOf
    if (this.schema.multipleOf !== undefined) {
      if (Math.abs(data % this.schema.multipleOf) !== 0) {
        context.addIssue({
          code: LuftErrorCodes.MULTIPLE_OF,
          message: `${data} is not a multiple of ${this.schema.multipleOf}`,
          path: [...context.path],
          multipleOf: this.schema.multipleOf,
        })
        return {
          success: false,
        }
      }
    }

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

  private isToSmall(data: number): boolean {
    if (this.schema.minCompare === ">") {
      return !(data > this.schema.min)
    } else {
      return !(data >= this.schema.min)
    }
  }

  private isToLarge(data: number): boolean {
    if (this.schema.maxCompare === "<") {
      return !(data < this.schema.max)
    } else {
      return !(data <= this.schema.max)
    }
  }
}
