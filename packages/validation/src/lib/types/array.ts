/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { createInvalidTypeIssue } from "../helpers"
import { LuftErrorCodes } from "../parsing-error"
import { InternalLuftBaseType, InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftArray<T> extends LuftBaseType<T[]> {
  public readonly supportedTypes = ["array"]

  public constructor(
    public override readonly schema: {
      parser: "json" | "csv" | undefined
      maxLength: number
      minLength: number
      nonEmpty: boolean
      type: LuftBaseType<unknown>
    }
  ) {
    super()
  }

  public clone(): LuftArray<T> {
    return new LuftArray<T>({
      ...this.schema,
      type: this.schema.type.clone(),
    })
  }

  public minLength(minLength: number): LuftArray<T> {
    this.schema.minLength = minLength
    return this
  }

  public maxLength(minLength: number): LuftArray<T> {
    this.schema.maxLength = minLength
    return this
  }

  public nonEmpty(allowNonEmpty = false) {
    this.schema.nonEmpty = allowNonEmpty
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
    // Check if the data is an array
    if (Array.isArray(data)) {
      // Check if the array is empty
      if (this.schema.nonEmpty && data.length === 0) {
        context.addIssue({
          code: LuftErrorCodes.INVALID_LENGTH,
          path: [...context.path],
          message: "Array must not be empty",
          maxLen: this.schema.maxLength,
          minLen: 1,
          actualLen: 0,
        })
        return {
          success: false,
        }
      }

      // Check if the array is too long
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

      // Check if the array is too short
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

      // This will track if one of the elments in the array is invalid. If this is the case at the end of the validation
      // we will return an error, but we still parsed every element in the array and therefore have every error in the
      // array
      let failAtEnd = false
      // Data gets copied, because we will modify it by passing it to the validators of the array element.
      // If one of the validators coerces the value we have to save the updated value
      data = [...data]
      // Check every element of the array for the right type
      for (let i = 0; i < (data as unknown[]).length; ++i) {
        const result = (this.schema.type as InternalLuftBaseType<unknown>)[mode]((data as unknown[])[i], context)
        if (result.success) {
          // Save the returned data, because there mey have been some coerced values
          ;(data as unknown[])[i] = result.data
        } else {
          failAtEnd = true
        }
      }

      if (failAtEnd) return { success: false }
    } else {
      // The data is not an array, so return an error
      createInvalidTypeIssue(data, this.supportedTypes, context)
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
