/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { createInvalidTypeIssue } from "../helpers"
import { LuftErrorCodes } from "../parsing-error"
import { InternalParsingResult, LuftBaseType } from "./base-type"
import { ParsingContext } from "../parsing-context"

export class LuftString extends LuftBaseType<string> {
  public get supportedTypes() {
    return ["string"]
  }

  constructor(
    public override readonly schema: { minLength: number; maxLength: number; trim: boolean } = {
      minLength: -Infinity,
      maxLength: Infinity,
      trim: false,
    }
  ) {
    super()
  }

  public clone(): LuftString {
    return new LuftString({ ...this.schema }).replaceValidationStorage(this.validationStorage)
  }

  public min(minLength: number): LuftString {
    const newValidator = this.clone()
    newValidator.schema.minLength = minLength
    return newValidator
  }

  public max(maxLength: number): LuftString {
    const newValidator = this.clone()
    newValidator.schema.maxLength = maxLength
    return newValidator
  }

  public trim(shouldTrim: boolean): LuftString {
    const newValidator = this.clone()
    newValidator.schema.trim = shouldTrim
    return newValidator
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    if (typeof data === "string" && this.schema.trim) {
      data = data.trim()
    }
    return this._validate(data, context)
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    if (typeof data === "string") {
      if (data.length > this.schema.maxLength) {
        context.addIssue({
          code: LuftErrorCodes.INVALID_LENGTH,
          path: [...context.path],
          message: `String length cannot be larger than ${this.schema.maxLength}, but it actually was ${data.length}`,
          maxLen: this.schema.maxLength,
          minLen: this.schema.minLength,
          actualLen: data.length,
        })
        return {
          success: false,
        }
      }

      if (data.length < this.schema.minLength) {
        context.addIssue({
          code: LuftErrorCodes.INVALID_LENGTH,
          path: [...context.path],
          message: `String length cannot be smaller than ${this.schema.minLength}, but it actually was ${data.length}`,
          maxLen: this.schema.maxLength,
          minLen: this.schema.minLength,
          actualLen: data.length,
        })
        return {
          success: false,
        }
      }

      return {
        success: true,
        data: data,
      }
    }

    context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
    return {
      success: false,
    }
  }
}
