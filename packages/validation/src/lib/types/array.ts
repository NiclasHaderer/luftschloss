/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { createInvalidTypeIssue } from "../helpers"
import { ParsingContext } from "../parsing-context"
import { LuftErrorCodes } from "../validation-error"
import { InternalLuftBaseType, InternalParsingResult, LuftInfer, LuftType } from "./base-type"
import { deepCopy } from "@luftschloss/common"

type LuftArrayConstructor = {
  parser: "json" | "csv" | "nothing"
  maxLength: number | undefined
  minLength: number | undefined
  unique: boolean
}

export class LuftArray<ARRAY_TYPE extends LuftType> extends LuftType<LuftInfer<ARRAY_TYPE>[]> {
  public readonly supportedTypes = ["array"]
  public readonly schema: LuftArrayConstructor & { type: ARRAY_TYPE }

  public constructor({
    type,
    parser = "nothing",
    maxLength = undefined,
    minLength = undefined,
    unique = false,
  }: Partial<LuftArrayConstructor> & { type: ARRAY_TYPE }) {
    super()
    this.schema = { type, parser, maxLength, minLength, unique }
  }

  public clone(): LuftArray<ARRAY_TYPE> {
    return new LuftArray<ARRAY_TYPE>({
      ...this.schema,
      type: this.schema.type.clone() as ARRAY_TYPE,
    }).replaceValidationStorage(deepCopy(this.validationStorage))
  }

  public unique(unique: boolean): LuftArray<ARRAY_TYPE> {
    const newValidator = this.clone()
    newValidator.schema.unique = unique
    return newValidator
  }

  public minLength(minLength: number | undefined): LuftArray<ARRAY_TYPE> {
    const newValidator = this.clone()
    newValidator.schema.minLength = minLength
    return newValidator
  }

  public maxLength(minLength: number | undefined): LuftArray<ARRAY_TYPE> {
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

    return this._validate(data, context)
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<LuftInfer<ARRAY_TYPE>[]> {
    // Check if the data is not an array
    if (!Array.isArray(data)) {
      // The data is not an array, so return an error
      context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
      return {
        success: false,
      }
    }

    // Check if array has duplicate values
    if (this.schema.unique) {
      const unique = new Set(data).size === data.length
      if (!unique) {
        context.addIssue({
          code: LuftErrorCodes.NOT_UNIQUE,
          path: [...context.path],
          message: "Array has duplicate values",
        })
        return { success: false }
      }
    }

    // Check if the array is too long
    if (this.schema.maxLength !== undefined && data.length > this.schema.maxLength) {
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
    if (this.schema.minLength !== undefined && data.length < this.schema.minLength) {
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
      context.stepInto(i.toString())
      const result = (this.schema.type as unknown as InternalLuftBaseType<unknown>).run(
        (data as unknown[])[i],
        context,
        true
      )
      context.stepOut()
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
      usedValidator: this,
    }
  }
}
