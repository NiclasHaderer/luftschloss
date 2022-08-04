/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { saveObject } from "@luftschloss/core"
import { createInvalidTypeIssue } from "../helpers"
import { InternalLuftBaseType, InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"
import { LuftNumber } from "./number"
import { LuftString } from "./string"

export class LuftRecord<T extends Record<string | number, unknown>> extends LuftBaseType<T> {
  readonly supportedTypes: string[] = ["object"]

  // TODO allow unions with are a union of LuftString and LuftNumber
  //  LuftLiterals are not allowed as keys, because you should use an object instead
  constructor(public readonly schema: { key: LuftString | LuftNumber; value: LuftBaseType<unknown> }) {
    super()
  }

  public clone(): LuftRecord<T> {
    return new LuftRecord({ ...this.schema, key: this.schema.key.clone(), value: this.schema.value.clone() })
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<T> {
    return this._validate(data, context)
  }

  protected _validate(
    data: unknown,
    context: ParsingContext,
    mode: "_validate" | "_coerce" = "_validate"
  ): InternalParsingResult<T> {
    if (typeof data !== "object" || data === null) {
      context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
      return { success: false }
    }

    const newData = saveObject<T>()
    let failAtEnd = false
    for (const [key, value] of Object.entries(data)) {
      const parsedKey = (this.schema.key as unknown as InternalLuftBaseType<unknown>)[mode](key, context)
      const parsedValue = (this.schema.value as unknown as InternalLuftBaseType<unknown>)[mode](value, context)

      if (parsedKey.success && parsedValue.success) {
        ;(newData as Record<string | number, unknown>)[parsedKey.data as string | number] = parsedValue.data
      } else {
        failAtEnd = true
      }
    }
    if (failAtEnd) {
      return { success: false }
    }

    return { success: true, data: newData }
  }
}
