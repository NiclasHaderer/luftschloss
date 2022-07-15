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

  public constructor(
    public override readonly schema: {
      parser: "json" | "csv" | undefined
      maxLength: number
      minLength: number
      type: LuftBaseType<unknown>
    }
  ) {
    super()
  }

  public minLength(minLength: number): LuftArray<T> {
    this.schema.minLength = minLength
    return this
  }

  public maxLength(minLength: number): LuftArray<T> {
    this.schema.maxLength = minLength
    return this
  }

  public parseWith(parser: "json" | "csv"): LuftArray<T> {
    this.schema.parser = parser
    return this
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<T[]> {
    if (typeof data === "object" && data && Symbol.iterator in data && !Array.isArray(data)) {
      data = [...(data as Iterable<unknown>)]
    }

    if (typeof data === "string" && this.schema.parser) {
      switch (this.schema.parser) {
        case "json": {
          try {
            data = JSON.parse(data as string)
          } catch {
            // Ignore because the "validate" function will send the error message
          }
          break
        }
        case "csv":
          data = data.split(",")
          break
      }
    }

    return this._validate(data, context, "_coerce")
  }

  protected _validate(
    data: unknown,
    context: ParsingContext,
    mode: "_coerce" | "_validate" = "_validate"
  ): InternalParsingResult<T[]> {
    if (Array.isArray(data)) {
      if (data.length > this.schema.maxLength) {
        context.addIssue({
          code: LuftErrorCodes.INVALID_LENGTH,
          path: [...context.path],
          message: `Array length cannot be larger than ${this.schema.maxLength}, but it actually was ${data.length}`,
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
          message: `Array length cannot be smaller than ${this.schema.minLength}, but it actually was ${data.length}`,
          maxLen: this.schema.maxLength,
          minLen: this.schema.minLength,
          actualLen: data.length,
        })
        return {
          success: false,
        }
      }

      let failAtEnd = false
      data = [...data]
      for (let i = 0; i < (data as unknown[]).length; ++i) {
        const result = (this.schema.type as InternalLuftBaseType<unknown>)[mode]((data as unknown[])[i], context)
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
