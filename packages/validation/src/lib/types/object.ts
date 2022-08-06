/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { saveObject } from "@luftschloss/core"
import { createInvalidTypeIssue } from "../helpers"
import { LuftErrorCodes } from "../parsing-error"
import { InternalLuftBaseType, InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"
import { LuftInfer } from "../infer"

// TODO object merge, pick, omit, partial, deepPartial
// TODO every modification has to create a new object (clone)

type ExtractType<T extends Record<string, LuftBaseType<unknown>>> = {
  [KEY in keyof T]: LuftInfer<T[KEY]>
}

const getAdditionalKeys = (actualKeys: string[], targetKeys: string[]): string[] =>
  actualKeys.filter(key => targetKeys.includes(key))

const getMissingKeys = (actualKeys: string[], targetKeys: string[]): string[] =>
  targetKeys.filter(key => actualKeys.includes(key))

export class LuftObject<T extends Record<string, LuftBaseType<unknown>>> extends LuftBaseType<ExtractType<T>> {
  public readonly supportedTypes = ["object"]
  protected returnType!: ExtractType<T>

  public constructor(
    public override readonly schema: { type: T; treatMissingKeyAs: "error" | "undefined"; ignoreUnknownKeys: boolean }
  ) {
    super()
  }

  public clone(): LuftObject<T> {
    const clonedType = Object.keys(this.schema.type).reduce((acc, key) => {
      ;(acc as Record<string, LuftBaseType<unknown>>)[key] = this.schema.type[key].clone()
      return acc
    }, {} as T)

    return new LuftObject({ ...this.schema, type: clonedType })
  }

  public ignoreUnknownKeys(ignore: boolean): LuftObject<T> {
    this.schema.ignoreUnknownKeys = ignore

    return this
  }

  public treatMissingKeyAs(treatAs: "error" | "undefined"): LuftObject<T> {
    this.schema.treatMissingKeyAs = treatAs

    return this
  }

  protected override _coerce(data: unknown, context: ParsingContext): InternalParsingResult<ExtractType<T>> {
    // TODO perhaps if string try json.parse and then validate
    return this._validate(data, context, "_coerce")
  }

  protected override _validate(
    data: unknown,
    context: ParsingContext,
    mode: "_coerce" | "_validate" = "_validate"
  ): InternalParsingResult<ExtractType<T>> {
    if (typeof data !== "object" || data === null) {
      context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
      return { success: false }
    }

    let failAtEnd = false

    const dataKeys = Object.keys(data)
    const schemaKeys = Object.keys(this.schema)
    if (!this.schema.ignoreUnknownKeys && dataKeys.length > schemaKeys.length) {
      context.addIssue({
        code: LuftErrorCodes.TO_MANY_KEYS,
        path: [...context.path],
        message: "Object keys do not match",
        additionalKeys: getAdditionalKeys(dataKeys, schemaKeys),
      })
      failAtEnd = true
    }

    let detectedMissingKeys = false
    const parsedObject = saveObject<ExtractType<T>>()
    for (const [key, validator] of Object.entries(this.schema.type)) {
      if (!(key in data) && this.schema.treatMissingKeyAs === "error" && !detectedMissingKeys) {
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
