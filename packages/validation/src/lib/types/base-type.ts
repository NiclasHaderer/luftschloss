/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { uniqueList } from "@luftschloss/core"
import { createInvalidTypeIssue } from "../helpers"
import { LuftParsingError, ParsingIssue } from "../parsing-error"
import { LuftTypeOf } from "../types"

export type InternalParsingResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      data?: never
    }

type ParsingResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      issues: ParsingIssue[]
    }

export class ParsingContext {
  private _issues: ParsingIssue[] = []
  public readonly path: Readonly<string | number[]> = []

  public addIssue(issue: ParsingIssue): ParsingContext {
    this._issues.push(issue)
    return this
  }

  public get hasIssues() {
    return this._issues.length !== 0
  }

  public get issues() {
    return this._issues
  }
}

export type InternalLuftBaseType<OUT_TYPE> = {
  _validate(data: unknown, context: ParsingContext): InternalParsingResult<OUT_TYPE>

  _coerce(data: unknown, context: ParsingContext): InternalParsingResult<OUT_TYPE>
} & LuftBaseType<OUT_TYPE>

export abstract class LuftBaseType<T> {
  public readonly schema: Record<string, unknown> = {}

  public abstract readonly supportedTypes: string[]
  private beforeValidateHooks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[] = []
  private beforeCoerceHooks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[] = []

  public validate(data: unknown): T {
    const result = this.validateSave(data)
    if (result.success) {
      return result.data
    }
    throw new LuftParsingError(result.issues)
  }

  public validateSave(data: unknown): ParsingResult<T> {
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

  protected abstract _validate(data: unknown, context: ParsingContext): InternalParsingResult<T>

  public coerce(data: unknown): T {
    const result = this.coerceSave(data)
    if (result.success) {
      return result.data
    }
    throw new LuftParsingError(result.issues)
  }

  public coerceSave(data: unknown): ParsingResult<T> {
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

  protected abstract _coerce(data: unknown, context: ParsingContext): InternalParsingResult<T>

  public abstract clone(): LuftBaseType<T>

  // TODO fix type
  //public optional() {
  //  return new LuftUnion(this, new LuftUndefined())
  //}
  //
  //public nullable() {
  //  return new LuftUnion(this, new LuftNull())
  //}
  //
  //public nullish(): LuftNull<LuftTypeOf<LuftUndefined<T>>> {
  //  return new LuftUnion(this, new LuftNull(), new LuftUndefined())
  //}

  public or<T extends LuftBaseType<unknown>>(type: LuftBaseType<T>): LuftUnion<[T, this]> {
    return new LuftUnion(this, type)
  }

  public default(defaultValue: T): this {
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

export class LuftUnion<T extends LuftBaseType<unknown>[]> extends LuftBaseType<LuftTypeOf<T[number]>> {
  public override readonly schema: { types: LuftBaseType<unknown>[] }

  public constructor(...types: LuftBaseType<unknown>[]) {
    super()
    this.schema = { types: types }
  }

  public clone(): LuftUnion<T> {
    return new LuftUnion(...this.schema.types.map(type => type.clone()))
  }

  public get supportedTypes() {
    return uniqueList(this.schema.types.flatMap(s => s.supportedTypes))
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<LuftTypeOf<T[number]>> {
    return this.validateAndCoerce(data, context, "coerce")
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<LuftTypeOf<T[number]>> {
    return this.validateAndCoerce(data, context, "validate")
  }

  private validateAndCoerce(
    data: unknown,
    context: ParsingContext,
    mode: "validate" | "coerce"
  ): InternalParsingResult<LuftTypeOf<T[number]>> {
    const validators = this.schema as unknown as InternalLuftBaseType<LuftTypeOf<T[number]>>[]
    for (const validator of validators) {
      const cb = mode === "coerce" ? validator._coerce.bind(this) : validator._validate.bind(this)

      const result = cb(data, context)
      if (result.success) return result
    }

    context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
    return { success: false }
  }
}
