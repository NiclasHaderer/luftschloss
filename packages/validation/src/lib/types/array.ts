/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { createInvalidTypeIssue } from "../helpers"
import { ParsingContext } from "../parsing-context"
import { LuftErrorCodes } from "../parsing-error"
import { InternalLuftBaseType, InternalParsingResult, LuftBaseType, LuftInfer } from "./base-type"

type LuftArrayConstructor = {
  parser: "json" | "csv" | "nothing"
  maxLength: number
  minLength: number
}

export class LuftArray<ARRAY_TYPE extends LuftBaseType<unknown>> extends LuftBaseType<LuftInfer<ARRAY_TYPE>[]> {
  public readonly supportedTypes = ["array"]
  public readonly schema: LuftArrayConstructor & { type: ARRAY_TYPE }

  public constructor({
    type,
    parser = "nothing",
    maxLength = Infinity,
    minLength = 0,
  }: Partial<LuftArrayConstructor> & { type: ARRAY_TYPE }) {
    super()
    this.schema = { type, parser, maxLength, minLength }
  }

  public clone(): LuftArray<ARRAY_TYPE> {
    return new LuftArray<ARRAY_TYPE>({
      ...this.schema,
      type: this.schema.type.clone() as ARRAY_TYPE,
    })
  }

  public minLength(minLength: number): LuftArray<ARRAY_TYPE> {
    const newValidator = this.clone()
    newValidator.schema.minLength = minLength
    return newValidator
  }

  public maxLength(minLength: number): LuftArray<ARRAY_TYPE> {
    const newValidator = this.clone()
    newValidator.schema.maxLength = minLength
    return newValidator
  }

  public nonEmpty(nonEmpty: boolean): LuftArray<ARRAY_TYPE> {
    const newValidator = this.clone()
    newValidator.schema.minLength = nonEmpty ? 1 : 0
    return newValidator
  }

  public parseWith(parser: "json" | "csv" | "nothing"): LuftArray<ARRAY_TYPE> {
    const newValidator = this.clone()
    newValidator.schema.parser = parser
    return newValidator
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<LuftInfer<ARRAY_TYPE>[]> {
    if (typeof data === "object" && data && Symbol.iterator in data && !Array.isArray(data)) {
      data = [...(data as Iterable<unknown>)]
    }

    if (typeof data === "string") {
      switch (this.schema.parser) {
        case "json": {
          try {
            data = JSON.parse(data)
          } catch {
            context.addIssue({
              code: LuftErrorCodes.PARSING_ISSUE,
              path: [...context.path],
              message: "String is not a valid json",
              parser: "json",
            })
            return { success: false }
          }
          break
        }
        case "csv":
          data = data.split(",")
          break
        case "nothing":
          break
      }
    }

    return this._validate(data, context, "_coerce")
  }

  protected _validate(
    data: unknown,
    context: ParsingContext,
    mode: "_coerce" | "_validate" = "_validate"
  ): InternalParsingResult<LuftInfer<ARRAY_TYPE>[]> {
    // Check if the data is not an array
    if (!Array.isArray(data)) {
      // The data is not an array, so return an error
      context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
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
      const result = (this.schema.type as unknown as InternalLuftBaseType<unknown>)[mode](
        (data as unknown[])[i],
        context
      )
      if (result.success) {
        // Save the returned data, because there mey have been some coerced values
        ;(data as unknown[])[i] = result.data
      } else {
        failAtEnd = true
      }
    }

    if (failAtEnd) return { success: false }

    return {
      success: true,
      data: data as LuftInfer<ARRAY_TYPE>[],
    }
  }
}
