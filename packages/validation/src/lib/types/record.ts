/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { saveObject } from "@luftschloss/core"
import { createInvalidTypeIssue } from "../helpers"
import { ParsingContext } from "../parsing-context"
import { LuftErrorCodes } from "../parsing-error"
import { InternalLuftBaseType, InternalParsingResult, LuftBaseType, LuftInfer, LuftUnion } from "./base-type"
import { LuftNumber } from "./number"
import { LuftString } from "./string"

export type LuftRecordKey = LuftString | LuftNumber | LuftUnion<(LuftString | LuftNumber)[]>

export class LuftRecord<KEY extends LuftRecordKey, VALUE extends LuftBaseType<unknown>> extends LuftBaseType<
  Record<LuftInfer<KEY>, LuftInfer<VALUE>>
> {
  readonly supportedTypes: string[] = ["object"]
  public readonly schema: {
    key: KEY
    value: VALUE
    nonEmpty: boolean
  }

  constructor({ nonEmpty = false, key, value }: { key: KEY; value: VALUE; nonEmpty?: boolean }) {
    super()
    this.schema = { nonEmpty, key, value }
  }

  public clone(): LuftRecord<KEY, VALUE> {
    return new LuftRecord({
      ...this.schema,
      key: this.schema.key.clone() as KEY,
      value: this.schema.value.clone() as VALUE,
    })
      .beforeCoerce(true, ...this.beforeCoerceHooks)
      .beforeValidate(true, ...this.beforeValidateHooks)
  }

  public nonEmpty(nonEmpty: boolean) {
    const clone = this.clone()
    clone.schema.nonEmpty = nonEmpty
    return clone
  }

  protected _coerce(
    data: unknown,
    context: ParsingContext
  ): InternalParsingResult<Record<LuftInfer<KEY>, LuftInfer<VALUE>>> {
    return this._validate(data, context)
  }

  protected _validate(
    data: unknown,
    context: ParsingContext,
    mode: "_validate" | "_coerce" = "_validate"
  ): InternalParsingResult<Record<LuftInfer<KEY>, LuftInfer<VALUE>>> {
    if (typeof data !== "object" || data === null) {
      context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
      return { success: false }
    }

    if (this.schema.nonEmpty && Object.keys(data).length === 0) {
      context.addIssue({
        code: LuftErrorCodes.INVALID_LENGTH,
        message: "Record is empty",
        path: [...context.path],
        actualLen: 0,
        maxLen: Infinity,
        minLen: 0,
      })
      return { success: false }
    }

    const newData = saveObject<Record<LuftInfer<KEY>, LuftInfer<VALUE>>>()
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
