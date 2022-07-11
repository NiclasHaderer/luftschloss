/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { getTypeOf } from "../helpers"
import { LuftErrorCodes } from "../parsing-error"
import { InternalLuftBaseType, InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftArray<T> extends LuftBaseType<T[]> {
  public readonly supportedTypes = ["array"]
  private _minLength = -Infinity
  private _maxLength = Infinity

  public constructor(public override readonly schema: LuftBaseType<unknown>) {
    super()
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<T[]> {
    if (typeof data === "object" && data && Symbol.iterator in data && !Array.isArray(data)) {
      data = [...(data as Iterable<unknown>)]
    }
    // TODO perhaps if string try json.parse and then validate
    return this._validate(data, context, "_coerce")
  }

  public minLength(minLength: number): LuftArray<T> {
    this._minLength = minLength
    return this
  }

  public maxLength(minLength: number): LuftArray<T> {
    this._maxLength = minLength
    return this
  }

  protected _validate(
    data: unknown,
    context: ParsingContext,
    mode: "_coerce" | "_validate" = "_validate"
  ): InternalParsingResult<T[]> {
    if (Array.isArray(data)) {
      if (data.length > this._maxLength) {
        context.addIssue({
          code: LuftErrorCodes.INVALID_LENGTH,
          path: [...context.path],
          message: `Array length cannot be larger than ${this._maxLength}, but it actually was ${data.length}`,
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
          message: `Array length cannot be smaller than ${this._minLength}, but it actually was ${data.length}`,
          maxLen: this._maxLength,
          minLen: this._minLength,
          actualLen: data.length,
        })
        return {
          success: false,
        }
      }

      let failAtEnd = false
      //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data = [...data]
      for (let i = 0; i < (data as unknown[]).length; ++i) {
        const result = (this.schema as InternalLuftBaseType<unknown>)[mode]((data as unknown[])[i], context)
        if (result.success) {
          //eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(data as unknown[])[i] = result.data
        } else {
          failAtEnd = true
        }
      }

      if (failAtEnd) return { success: false }
    } else {
      context.addIssue({
        code: LuftErrorCodes.INVALID_TYPE,
        message: `Expected type array, but got ${getTypeOf(data)}`,
        path: [...context.path],
        expectedType: ["array"],
        receivedType: getTypeOf(data),
      })
      return {
        success: false,
      }
    }

    return {
      success: true,
      data: data as T[],
    }
  }
}
