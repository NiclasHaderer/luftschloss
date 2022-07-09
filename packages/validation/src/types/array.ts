/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { getTypeOf } from "../helpers"
import { InternalLuftBaseType, InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftArray<T> extends LuftBaseType<T[]> {
  public readonly supportedTypes = ["array"]

  public constructor(public override readonly schema: LuftBaseType<unknown>) {
    super()
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<T[]> {
    if (typeof data === "object" && data && Symbol.iterator in data && !Array.isArray(data)) {
      data = [...(data as Iterable<unknown>)]
    }
    return this._validate(data, context, "_coerce")
  }

  protected _validate(
    data: unknown,
    context: ParsingContext,
    mode: "_coerce" | "_validate" = "_validate"
  ): InternalParsingResult<T[]> {
    if (Array.isArray(data)) {
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
        code: "INCOMPATIBLE_TYPE",
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
