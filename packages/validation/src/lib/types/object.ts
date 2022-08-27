/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { deepCopy, saveObject } from "@luftschloss/common"
import { createInvalidTypeIssue } from "../helpers"
import { ParsingContext } from "../parsing-context"
import { LuftErrorCodes } from "../validation-error"
import {
  InternalLuftBaseType,
  InternalParsingResult,
  LuftBaseType,
  LuftInfer,
  LuftType,
  LuftUndefined,
  LuftUnion,
} from "./base-type"

// TODO deepPartial

type ExtractType<T extends Record<string, LuftType>> = {
  [KEY in keyof T]: LuftInfer<T[KEY]>
}

type ObjectPartial<T extends Record<string, LuftType>> = {
  [KEY in keyof T]: LuftUnion<[LuftUndefined, T[KEY]]>
}

type LuftObjectConstructor = {
  treatMissingKeyAs: "error" | "undefined"
  ignoreUnknownKeys: boolean
  tryParseString: boolean
}

const getAdditionalKeys = (toManyKeys: string[], allKeys: string[]): string[] =>
  toManyKeys.filter(key => !allKeys.includes(key))

const getMissingKeys = (partialKeys: string[], allKeys: string[]): string[] =>
  allKeys.filter(key => !partialKeys.includes(key))

const copyValidatorObject = <T extends Record<string, LuftType>>(object: T): T => {
  const newObject = saveObject<Record<string, LuftType>>()
  for (const [key, value] of Object.entries(object)) {
    newObject[key] = value.clone()
  }

  return newObject as T
}

export class LuftObject<T extends Record<string, LuftType>> extends LuftBaseType<ExtractType<T>> {
  public readonly supportedTypes = ["object"]
  public schema: { type: T } & LuftObjectConstructor

  public constructor({
    treatMissingKeyAs = "error",
    ignoreUnknownKeys = true,
    tryParseString = false,
    type,
  }: Partial<LuftObjectConstructor> & {
    type: T
  }) {
    super()
    this.schema = {
      treatMissingKeyAs,
      ignoreUnknownKeys,
      type,
      tryParseString,
    }
  }

  public extend<NEW_TYPE extends Record<string, LuftType>>(
    object: LuftObject<NEW_TYPE>,
    name?: string
  ): LuftObject<T & NEW_TYPE> {
    return this.merge(object.schema.type, name)
  }

  public merge<NEW_OBJECT extends Record<string, LuftType>>(
    object: NEW_OBJECT,
    name?: string
  ): LuftObject<T & NEW_OBJECT> {
    return new LuftObject({
      ...this.schema,
      type: {
        ...copyValidatorObject(this.schema.type),
        ...copyValidatorObject(object),
      },
    })
  }

  public omit<KEY extends keyof T & string>(keys: KEY[], name?: string): LuftObject<Omit<T, KEY>> {
    const keysToPick = getMissingKeys(keys, Object.keys(this.schema.type))
    return this.pick(keysToPick, name) as LuftObject<Omit<T, KEY>>
  }

  public pick<KEY extends keyof T & string>(keys: KEY[], name?: string): LuftObject<Pick<T, KEY>> {
    const finishedObject = keys.reduce((acc, key) => {
      acc[key] = this.schema.type[key].clone()
      return acc
    }, {} as Record<string, LuftType>)

    return new LuftObject<Pick<T, KEY>>({
      ...this.schema,
      type: finishedObject as Pick<T, KEY>,
    })
  }

  public partial(name?: string): LuftObject<ObjectPartial<T>> {
    const type = this.schema.type
    const newType = Object.keys(this.schema.type).reduce((acc, key) => {
      acc[key] = type[key].optional()
      return acc
    }, {} as Record<string, LuftType>)

    return new LuftObject<ObjectPartial<T>>({
      ...this.schema,
      type: newType as ObjectPartial<T>,
    }).treatMissingKeyAs("undefined")
  }

  public clone(): LuftObject<T> {
    const clonedType = Object.keys(this.schema.type).reduce((acc, key) => {
      ;(acc as Record<string, LuftType>)[key] = this.schema.type[key].clone()
      return acc
    }, {} as T)

    return new LuftObject({ ...this.schema, type: clonedType }).replaceValidationStorage(
      deepCopy(this.validationStorage)
    )
  }

  public ignoreUnknownKeys(ignore: boolean): LuftObject<T> {
    const newValidator = this.clone()
    newValidator.schema.ignoreUnknownKeys = ignore
    return newValidator
  }

  public treatMissingKeyAs(treatAs: "error" | "undefined"): LuftObject<T> {
    const newValidator = this.clone()
    newValidator.schema.treatMissingKeyAs = treatAs
    return newValidator
  }

  public tryParseString(parseString: boolean): LuftObject<T> {
    const newValidator = this.clone()
    newValidator.schema.tryParseString = parseString
    return newValidator
  }

  protected override _coerce(data: unknown, context: ParsingContext): InternalParsingResult<ExtractType<T>> {
    if (this.schema.tryParseString && typeof data === "string") {
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
    }
    return this._validate(data, context, "_coerce")
  }

  protected override _validate(
    data: unknown,
    context: ParsingContext,
    mode: "_coerce" | "_validate" = "_validate"
  ): InternalParsingResult<ExtractType<T>> {
    // Wrong type
    if (typeof data !== "object" || data === null) {
      context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
      return { success: false }
    }

    // Tack if the validation should fail at the end
    let failAtEnd = false

    // Get the keys of the data and the schema
    const dataKeys = Object.keys(data)
    const schemaKeys = Object.keys(this.schema.type)

    // Do NOT ignore unknown keys
    if (!this.schema.ignoreUnknownKeys) {
      const additionalKeys = getAdditionalKeys(dataKeys, schemaKeys)
      // If there are to many keys add the issue
      if (additionalKeys.length > 0) {
        context.addIssue({
          code: LuftErrorCodes.TO_MANY_KEYS,
          path: [...context.path],
          message: "Object keys do not match",
          additionalKeys: additionalKeys,
        })
        failAtEnd = true
      }
    }

    // This tracks if missing tracks have already been detected
    // This stops the issue being added twice
    let detectedMissingKeys = false

    // The object for the new data
    const parsedObject = saveObject<ExtractType<T>>()
    // Iterate over the schema
    for (const [key, validator] of Object.entries(this.schema.type)) {
      // The key is not in the data and missingKeys should be treated as error and not as undefined
      // Only step in this condition if the condition has not been executed before
      if (!(key in data) && this.schema.treatMissingKeyAs === "error" && !detectedMissingKeys) {
        // Save that the validation should fail
        failAtEnd = true
        // Do NOT enter this condition again
        detectedMissingKeys = true
        context.addIssue({
          code: LuftErrorCodes.MISSING_KEYS,
          path: [...context.path],
          message: "Object keys do not match",
          missingKeys: getMissingKeys(dataKeys, schemaKeys),
        })
        // Skip validation, because the key does not exist
        continue
      }

      // Validate the retrieved value
      const a = (validator as InternalLuftBaseType<unknown>)[mode]((data as Record<string, unknown>)[key], context)
      if (a.success) {
        // Save the (potentially) coerced value in the new object
        ;(parsedObject as Record<string, unknown>)[key] = a.data
      } else {
        failAtEnd = true
      }
    }
    if (failAtEnd) return { success: false }

    return { success: true, data: parsedObject }
  }
}
