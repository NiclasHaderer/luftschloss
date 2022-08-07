/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { uniqueList } from "@luftschloss/core"
import { createInvalidTypeIssue, getTypeOf } from "../helpers"
import { LuftErrorCodes, LuftParsingError, ParsingError } from "../parsing-error"
import { LuftInfer } from "../infer"
import { ParsingContext } from "../parsing-context"

export type InternalParsingResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      data?: never
    }

export type SuccessfulParsingResult<T> = {
  success: true
  data: T
}
export type UnsuccessfulParsingResult = {
  success: false
  issues: ParsingError[]
}

export type ParsingResult<T> = SuccessfulParsingResult<T> | UnsuccessfulParsingResult

export type InternalLuftBaseType<OUT_TYPE> = {
  _validate(data: unknown, context: ParsingContext): InternalParsingResult<OUT_TYPE>

  _coerce(data: unknown, context: ParsingContext): InternalParsingResult<OUT_TYPE>
} & LuftBaseType<OUT_TYPE>

export abstract class LuftBaseType<RETURN_TYPE> {
  public abstract readonly schema: Record<string, unknown>

  public abstract readonly supportedTypes: string[]
  private beforeValidateHooks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[] = []
  private beforeCoerceHooks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[] = []

  public validate(data: unknown): RETURN_TYPE {
    const result = this.validateSave(data)
    if (result.success) {
      return result.data
    }
    throw new LuftParsingError(result.issues)
  }

  public validateSave(data: unknown): ParsingResult<RETURN_TYPE> {
    const context = new ParsingContext()
    const resultData = this._validate(data, context)

    for (const coerceBeforeHook of this.beforeValidateHooks) {
      const result = coerceBeforeHook(data, context)
      if (result.success) {
        data = result.data
      } else {
        return {
          success: false,
          issues: context.issues,
        }
      }
    }

    // Issues, but no success
    if (context.hasIssues && resultData.success) {
      throw new Error(
        "Context has issues, but the parsing result is marked as valid. Please check if your parser added issues if he returned false"
      )
    }
    // No success, but also no issues
    else if (!context.hasIssues && !resultData.success) {
      throw new Error(
        "Context does not have issues, but the parsing result is marked as valid. Please add issues if the result is not valid."
      )
    }
    // Successful
    else if (resultData.success) {
      return {
        success: true,
        data: resultData.data,
      }
    }
    // Not successful
    else {
      return {
        success: false,
        issues: context.issues,
      }
    }
  }

  protected abstract _validate(data: unknown, context: ParsingContext): InternalParsingResult<RETURN_TYPE>

  public coerce(data: unknown): RETURN_TYPE {
    const result = this.coerceSave(data)
    if (result.success) {
      return result.data
    }
    throw new LuftParsingError(result.issues)
  }

  public coerceSave(data: unknown): ParsingResult<RETURN_TYPE> {
    const context = new ParsingContext()

    for (const coerceBeforeHook of this.beforeCoerceHooks) {
      const result = coerceBeforeHook(data, context)
      if (result.success) {
        data = result.data
      } else {
        return {
          success: false,
          issues: context.issues,
        }
      }
    }

    const resultData = this._coerce ? this._coerce(data, context) : this._validate(data, context)

    if (context.hasIssues && !resultData.success) {
      return {
        success: false,
        issues: context.issues,
      }
    }

    if (!context.hasIssues && resultData.success) {
      return {
        success: true,
        data: resultData.data,
      }
    }

    throw new Error(
      "Context has issues, but the parsing result is marked as valid. Please check you parsers for errors"
    )
  }

  protected abstract _coerce(data: unknown, context: ParsingContext): InternalParsingResult<RETURN_TYPE>

  public abstract clone(): LuftBaseType<RETURN_TYPE>

  public optional(): LuftUnion<[this, LuftUndefined]> {
    return new LuftUnion({ types: [this, new LuftUndefined()] })
  }

  public nullable(): LuftUnion<[this, LuftNull]> {
    return new LuftUnion({ types: [this, new LuftNull()] })
  }

  public nullish(): LuftUnion<[this, LuftNull, LuftUndefined]> {
    return new LuftUnion({ types: [this, new LuftNull(), new LuftUndefined()] })
  }

  public or<T extends LuftBaseType<unknown>>(type: T): LuftUnion<(T | this)[]> {
    return new LuftUnion({ types: [this, type] })
  }

  public default(defaultValue: RETURN_TYPE): this {
    const addDefaultFun = (coerceValue: unknown): InternalParsingResult<unknown> => {
      if (coerceValue === undefined || coerceValue === null) {
        return {
          success: true,
          data: defaultValue,
        }
      }
      return { success: true, data: coerceValue }
    }

    this.beforeValidate(addDefaultFun)
    this.beforeCoerce(addDefaultFun)
    return this
  }

  public beforeValidate(cb: (value: unknown, context: ParsingContext) => InternalParsingResult<unknown>): this {
    this.beforeValidateHooks.push(cb)
    return this
  }

  public beforeCoerce(cb: (value: unknown, context: ParsingContext) => InternalParsingResult<unknown>): this {
    this.beforeCoerceHooks.push(cb)
    return this
  }
}

export class LuftUndefined extends LuftBaseType<undefined> {
  public readonly schema = {}

  public supportedTypes = ["undefined"]

  public clone(): LuftUndefined {
    return new LuftUndefined()
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<undefined> {
    return this._validate(data, context)
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<undefined> {
    if (data === undefined) return { success: true, data }
    context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
    return { success: false }
  }
}

export class LuftNull extends LuftBaseType<null> {
  public supportedTypes = ["null"]
  public readonly schema = {}

  public clone(): LuftNull {
    return new LuftNull()
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<null> {
    return this._validate(data, context)
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<null> {
    if (data === null) return { success: true, data }
    context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
    return { success: false }
  }
}

export class LuftUnion<T extends LuftBaseType<unknown>[]> extends LuftBaseType<LuftInfer<T[number]>> {
  public constructor(public readonly schema: { types: T }) {
    super()
  }

  public clone(): LuftUnion<T> {
    return new LuftUnion({ types: this.schema.types.map(type => type.clone()) as T })
  }

  public get supportedTypes() {
    return uniqueList(this.schema.types.flatMap(s => s.supportedTypes))
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<LuftInfer<T[number]>> {
    return this.validateAndCoerce(data, context, "_coerce")
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<LuftInfer<T[number]>> {
    return this.validateAndCoerce(data, context, "_validate")
  }

  private validateAndCoerce(
    data: unknown,
    context: ParsingContext,
    mode: "_validate" | "_coerce"
  ): InternalParsingResult<LuftInfer<T[number]>> {
    const validators = this.schema.types as unknown as InternalLuftBaseType<LuftInfer<T[number]>>[]
    const newErrors: ParsingError[] = []
    for (const validator of validators) {
      const customContext = context.cloneEmpty()
      const result = validator[mode](data, customContext)
      if (result.success) {
        return result
      } else {
        newErrors.push(...customContext.issues)
      }
    }

    context.addIssue({
      code: LuftErrorCodes.INVALID_UNION,
      message: `Could not match to any of the available types ${this.supportedTypes.join(", ")}`,
      path: [...context.path],
      expectedType: this.supportedTypes,
      receivedType: getTypeOf(data),
      errors: newErrors,
    })

    return { success: false }
  }
}
