/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { getTypeOf } from "../helpers"
import { LuftErrorCodes } from "../parsing-error"
import { InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftString extends LuftBaseType<string> {
  public readonly supportedTypes = ["string"]
  private _minLength = -Infinity
  private _maxLength = Infinity

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    return this._validate(data, context)
  }

  public minLength(minLength: number): LuftString {
    this._minLength = minLength
    return this
  }

  public maxLength(minLength: number): LuftString {
    this._maxLength = minLength
    return this
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    if (typeof data === "string") {
      if (data.length > this._maxLength) {
        context.addIssue({
          code: LuftErrorCodes.INVALID_LENGTH,
          path: [...context.path],
          message: `String length cannot be larger than ${this._maxLength}, but it actually was ${data.length}`,
          maxLen: this._maxLength,
          minLen: this._minLength,
          actualLen: data.length,
        })
        return {
          success: false,
        }
      }

      if (data.length < this._minLength) {
        context.addIssue({
          code: LuftErrorCodes.INVALID_LENGTH,
          path: [...context.path],
          message: `String length cannot be smaller than ${this._minLength}, but it actually was ${data.length}`,
          maxLen: this._maxLength,
          minLen: this._minLength,
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
