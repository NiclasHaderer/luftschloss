/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { createInvalidTypeIssue } from "../helpers"
import { LuftErrorCodes } from "../parsing-error"
import { InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftString extends LuftBaseType<string> {
  public readonly supportedTypes = ["string"]

  constructor(public override readonly schema: { minLength: number; maxLength: number; trim: boolean }) {
    super()
  }

  public clone(): LuftString {
    return new LuftString({ ...this.schema })
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    if (typeof data === "string" && this.schema.trim) {
      data = data.trim()
    }
    return this._validate(data, context)
  }

  public min(minLength: number): LuftString {
    this.schema.minLength = minLength
    return this
  }

  public max(maxLength: number): LuftString {
    this.schema.maxLength = maxLength
    return this
  }

  public trim(shouldTrim = true): LuftString {
    this.schema.trim = shouldTrim
    return this
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
