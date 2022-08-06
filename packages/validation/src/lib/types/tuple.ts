/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { InternalLuftBaseType, InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"
import { LuftInfer } from "../infer"
import { createInvalidTypeIssue } from "../helpers"
import { isArray } from "@luftschloss/core"
import { LuftErrorCodes } from "../parsing-error"

type ExtractType<T extends ReadonlyArray<LuftBaseType<unknown>>> = {
  [KEY in keyof T]: LuftInfer<T[KEY]>
}

export class LuftTuple<T extends ReadonlyArray<LuftBaseType<unknown>>> extends LuftBaseType<ExtractType<T>> {
  readonly supportedTypes = ["array"]
  protected returnType!: ExtractType<T>

  constructor(
    public override readonly schema: {
      types: T
      parser: "json" | "csv" | "nothing"
    }
  ) {
    super()
  }

  public clone(): LuftTuple<T> {
    return new LuftTuple<T>({
      ...this.schema,
      types: this.schema.types.map(t => t.clone()) as unknown as T,
    })
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
            data = JSON.parse(data as string)
          } catch {
            // Ignore because the "validate" function will send the error message
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

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<ExtractType<T>> {
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
    }

    let failAtEnd = false

    const newArray: unknown[] = []
    for (let i = 0; i < data.length; ++i) {
      const validationResult = (this.schema.types[i] as InternalLuftBaseType<unknown>)._validate(data, context)
      if (validationResult.success) {
        newArray[0] = validationResult.data
      } else {
        failAtEnd = true
      }
    }

    if (failAtEnd) return { success: false }
    return { success: true, data: newArray as unknown as ExtractType<T> }
  }
}
