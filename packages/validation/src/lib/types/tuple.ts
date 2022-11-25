/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { deepCopy, isArray } from "@luftschloss/common"
import { createInvalidTypeIssue } from "../helpers"
import { ParsingContext } from "../parsing-context"
import { LuftErrorCodes } from "../validation-error"
import { InternalLuftBaseType, InternalParsingResult, LuftInfer, LuftType } from "./base-type"

type ExtractType<T extends ReadonlyArray<LuftType>> = {
  [KEY in keyof T]: LuftInfer<T[KEY]>
}

export class LuftTuple<T extends ReadonlyArray<LuftType>> extends LuftType<ExtractType<T>> {
  readonly supportedTypes = ["array"]
  public override readonly schema: {
    types: T
    parser: "json" | "csv" | "nothing"
  }

  constructor({ types, parser = "nothing" }: { types: T; parser?: "json" | "csv" | "nothing" }) {
    super()
    this.schema = { types, parser }
  }

  public clone(): LuftTuple<T> {
    return new LuftTuple<T>({
      ...this.schema,
      types: this.schema.types.map(t => t.clone()) as unknown as T,
    }).replaceValidationStorage(deepCopy(this.validationStorage))
  }

  public parseWith(parser: "json" | "csv" | "nothing"): LuftTuple<T> {
    const newValidator = this.clone()
    newValidator.schema.parser = parser
    return newValidator
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<ExtractType<T>> {
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
    mode: "_validate" | "_coerce" = "_validate"
  ): InternalParsingResult<ExtractType<T>> {
    if (!isArray(data)) {
      context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
      return { success: false }
    }

    const dataLength = data.length
    const schemaLength = this.schema.types.length
    if (data.length !== schemaLength) {
      context.addIssue({
        code: LuftErrorCodes.INVALID_LENGTH,
        path: [...context.path],
        message: `Expected a length of ${schemaLength}, but got ${dataLength}`,
        maxLen: schemaLength,
        minLen: schemaLength,
        actualLen: dataLength,
      })
      return { success: false }
    }

    let failAtEnd = false

    const newArray: unknown[] = new Array(schemaLength)
    for (let i = 0; i < data.length; ++i) {
      context.stepInto(i)
      const validationResult = (this.schema.types[i] as unknown as InternalLuftBaseType<unknown>).run(
        data[i],
        context,
        true
      )
      context.stepOut()

      if (validationResult.success) {
        newArray[i] = validationResult.data
      } else {
        failAtEnd = true
      }
    }

    if (failAtEnd) return { success: false }
    return { success: true, data: newArray as unknown as ExtractType<T>, usedValidator: this }
  }
}
