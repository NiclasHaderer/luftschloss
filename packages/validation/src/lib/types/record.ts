/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { getTypeOf, saveObject } from "../helpers"
import { LuftErrorCodes } from "../parsing-error"
import { InternalLuftBaseType, InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

const getAdditionalKeys = (actualKeys: string[], targetKeys: string[]): string[] =>
  actualKeys.filter(key => targetKeys.includes(key))

const getMissingKeys = (actualKeys: string[], targetKeys: string[]): string[] =>
  targetKeys.filter(key => actualKeys.includes(key))

export class LuftRecord<T extends Record<string, LuftBaseType<unknown>>> extends LuftBaseType<T> {
  public readonly supportedTypes = ["record"]
  private _ignoreUnknownKeys = true
  private _treatMissingKeyAs: "error" | "undefined" = "undefined"

  public constructor(public override readonly schema: T) {
    super()
  }

  public ignoreUnknownKeys(ignore: boolean): LuftRecord<T> {
    this._ignoreUnknownKeys = ignore

    return this
  }

  public treatMissingKeyAs(treatAs: "error" | "undefined"): LuftRecord<T> {
    this._treatMissingKeyAs = treatAs

    return this
  }

  protected override _coerce(data: unknown, context: ParsingContext): InternalParsingResult<T> {
    // TODO perhaps if string try json.parse and then validate
    return this._validate(data, context, "_coerce")
  }

  protected override _validate(
    data: unknown,
    context: ParsingContext,
    mode: "_coerce" | "_validate" = "_validate"
  ): InternalParsingResult<T> {
    if (typeof data !== "object" || data === null) {
      context.addIssue({
        code: LuftErrorCodes.INVALID_TYPE,
        message: `Expected type record, but got ${getTypeOf(data)}`,
        path: [...context.path],
        receivedType: getTypeOf(data),
        expectedType: "record",
      })
      return { success: false }
    }

    let failAtEnd = false

    const dataKeys = Object.keys(data)
    const schemaKeys = Object.keys(this.schema)
    if (!this._ignoreUnknownKeys && dataKeys.length > schemaKeys.length) {
      context.addIssue({
        code: LuftErrorCodes.TO_MANY_KEYS,
        path: [...context.path],
        message: "Object keys do not match",
        additionalKeys: getAdditionalKeys(dataKeys, schemaKeys),
      })
      failAtEnd = true
    }

    let detectedMissingKeys = false
    const parsedObject = saveObject<T>()
    for (const [key, validator] of Object.entries(this.schema)) {
      if (!(key in data) && this._treatMissingKeyAs === "error" && !detectedMissingKeys) {
        failAtEnd = true
        detectedMissingKeys = true
        context.addIssue({
          code: LuftErrorCodes.MISSING_KEYS,
          path: [...context.path],
          message: "Object keys do not match",
          missingKeys: getMissingKeys(dataKeys, schemaKeys),
        })
        continue
      }

      const a = (validator as InternalLuftBaseType<unknown>)[mode]((data as Record<string, unknown>)[key], context)
      if (a.success) {
        //eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;(parsedObject as Record<string, unknown>)[key] = a.data
      } else {
        failAtEnd = true
      }
    }
    if (failAtEnd) return { success: false }

    return { success: true, data: parsedObject }
  }
}
