/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { deepCopy, saveObject } from "@luftschloss/common"
import { createInvalidTypeIssue } from "../helpers"
import { ParsingContext } from "../parsing-context"
import { LuftErrorCodes } from "../validation-error"
import { InternalLuftBaseType, InternalParsingResult, LuftBaseType, LuftInfer, LuftType, LuftUnion } from "./base-type"
import { LuftNumber } from "./number"
import { LuftRegex } from "./regexp"
import { LuftString } from "./string"

export type LuftRecordKey = LuftString | LuftNumber | LuftRegex | LuftUnion<(LuftString | LuftNumber | LuftRegex)[]>

export class LuftRecord<KEY extends LuftRecordKey, VALUE extends LuftType> extends LuftBaseType<
  Record<LuftInfer<KEY>, LuftInfer<VALUE>>
> {
  readonly supportedTypes: string[] = ["object"]
  public readonly schema: {
    key: KEY
    value: VALUE
    minProperties: number | undefined
    maxProperties: number | undefined
  }

  constructor({
    key,
    value,
    maxProperties,
    minProperties,
  }: {
    key: KEY
    value: VALUE
    minProperties?: number
    maxProperties?: number
  }) {
    super()
    this.schema = { key, value, minProperties, maxProperties }
  }

  public clone(): LuftRecord<KEY, VALUE> {
    return new LuftRecord({
      ...this.schema,
      key: this.schema.key.clone() as KEY,
      value: this.schema.value.clone() as VALUE,
    }).replaceValidationStorage(deepCopy(this.validationStorage))
  }

  public minProperties(min: number | undefined) {
    const clone = this.clone()
    clone.schema.minProperties = min
    return clone
  }

  public maxProperties(max: number | undefined) {
    const clone = this.clone()
    clone.schema.maxProperties = max
    return clone
  }

  public nonEmpty(nonEmpty: boolean) {
    const clone = this.clone()
    clone.schema.minProperties = nonEmpty ? 1 : 0
    return clone
  }

  protected _coerce(
    data: unknown,
    context: ParsingContext
  ): InternalParsingResult<Record<LuftInfer<KEY>, LuftInfer<VALUE>>> {
    return this._validate(data, context, "_coerce")
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

    const keyCount = Object.keys(data).length

    // To few keys
    if (this.schema.minProperties !== undefined && keyCount < this.schema.minProperties) {
      context.addIssue({
        code: LuftErrorCodes.INVALID_RANGE,
        message: `Expected at least ${this.schema.minProperties} properties, but got ${keyCount}`,
        path: [...context.path],
        min: this.schema.minProperties,
        max: this.schema.maxProperties,
        actual: keyCount,
        maxCompare: "<=",
        minCompare: ">=",
      })
      return { success: false }
    }

    // To many keys
    if (this.schema.maxProperties !== undefined && keyCount > this.schema.maxProperties) {
      context.addIssue({
        code: LuftErrorCodes.INVALID_RANGE,
        message: `Expected not more than ${this.schema.minProperties} properties, but got ${keyCount}`,
        path: [...context.path],
        min: this.schema.minProperties,
        max: this.schema.maxProperties,
        actual: keyCount,
        maxCompare: "<=",
        minCompare: ">=",
      })
      return { success: false }
    }

    const newData = saveObject<Record<LuftInfer<KEY>, LuftInfer<VALUE>>>()
    let failAtEnd = false
    for (const [key, value] of Object.entries(data)) {
      context.stepInto(key)
      const parsedKey = (this.schema.key as unknown as InternalLuftBaseType<unknown>)[mode](key, context)
      const parsedValue = (this.schema.value as unknown as InternalLuftBaseType<unknown>)[mode](value, context)
      context.stepOut()

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
