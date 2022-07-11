/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { getTypeOf, toListString, uniqueList } from "../helpers"
import { LuftErrorCodes, LuftParsingError, ParsingIssue } from "../parsing-error"
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

type UnpackNullish<T extends LuftBaseType<any>, LIMIT extends number> = _UnpackNullish<T, LIMIT, []>

type _UnpackNullish<
  T extends LuftBaseType<any>,
  LIMIT extends number,
  CURR extends null[]
> = CURR["length"] extends LIMIT
  ? T
  : T extends LuftNull<any> | LuftUndefined<any>
  ? _UnpackNullish<T["schema"], LIMIT, [null, ...CURR]>
  : T

export type InternalLuftBaseType<OUT_TYPE> = {
  _validate(data: unknown, context: ParsingContext): InternalParsingResult<OUT_TYPE>

  _coerce(data: unknown, context: ParsingContext): InternalParsingResult<OUT_TYPE>
} & LuftBaseType<OUT_TYPE>

export abstract class LuftBaseType<T> {
  public readonly schema: unknown
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

  protected abstract _coerce?(data: unknown, context: ParsingContext): InternalParsingResult<T>

  public optional() {
    return new LuftUndefined<T>(this)
  }

  public nullable() {
    return new LuftNull<T>(this)
  }

  public nullish(): LuftNull<LuftTypeOf<LuftUndefined<T>>> {
    const optional = new LuftUndefined<T>(this)
    return new LuftNull<LuftTypeOf<typeof optional>>(optional)
  }

  public required(): UnpackNullish<this, 100> {
    //eslint-disable-next-line @typescript-eslint/no-this-alias
    let type: LuftBaseType<unknown> = this
    while (type instanceof LuftUndefined || type instanceof LuftNull) {
      type = type.schema
    }

    return type as UnpackNullish<this, 100>
  }

  public or<T extends LuftBaseType<unknown>>(type: LuftBaseType<T>): LuftUnion<[T, this]> {
    return new LuftUnion(this, type)
  }

  public default(defaultValue: T): this {
    if (this instanceof LuftUndefined || this instanceof LuftNull) {
      throw new Error("You should not set a default value for an optional type")
    }

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

export class LuftUndefined<OUT_TYPE> extends LuftBaseType<OUT_TYPE | undefined> {
  public constructor(public override schema: LuftBaseType<OUT_TYPE>) {
    super()
  }

  public get supportedTypes() {
    return uniqueList([...this.schema.supportedTypes, "undefined"])
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<OUT_TYPE | undefined> {
    return this.validateAndCoerce(data, context, "coerce")
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<OUT_TYPE | undefined> {
    return this.validateAndCoerce(data, context, "validate")
  }

  private validateAndCoerce(
    data: unknown,
    context: ParsingContext,
    mode: "validate" | "coerce"
  ): InternalParsingResult<OUT_TYPE | undefined> {
    if (data === undefined) return { success: true, data }
    const schema = this.schema as unknown as InternalLuftBaseType<OUT_TYPE>
    const cb = mode === "coerce" ? schema._coerce.bind(this) : schema._validate.bind(this)
    return cb(data, context)
  }
}

export class LuftNull<OUT_TYPE> extends LuftBaseType<OUT_TYPE | null> {
  public constructor(public override schema: LuftBaseType<OUT_TYPE>) {
    super()
  }

  public get supportedTypes() {
    return uniqueList([...this.schema.supportedTypes, "null"])
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<OUT_TYPE | null> {
    return this.validateAndCoerce(data, context, "coerce")
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<OUT_TYPE | null> {
    return this.validateAndCoerce(data, context, "validate")
  }

  private validateAndCoerce(
    data: unknown,
    context: ParsingContext,
    mode: "validate" | "coerce"
  ): InternalParsingResult<OUT_TYPE | null> {
    if (data === null) return { success: true, data }
    const schema = this.schema as unknown as InternalLuftBaseType<OUT_TYPE>
    const cb = mode === "coerce" ? schema._coerce.bind(this) : schema._validate.bind(this)
    return cb(data, context)
  }
}

export class LuftUnion<T extends LuftBaseType<any>[]> extends LuftBaseType<LuftTypeOf<T[number]>> {
  public override readonly schema: LuftBaseType<any>[]

  public constructor(...schema: LuftBaseType<unknown>[]) {
    super()
    this.schema = schema
  }

  public get supportedTypes() {
    return uniqueList(this.schema.flatMap(s => s.supportedTypes))
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

    const supportedTypes = this.supportedTypes
    const receivedType = getTypeOf(data)
    context.addIssue({
      message: `Expected one of the supported types ${toListString(supportedTypes)}, but got ${receivedType}`,
      code: LuftErrorCodes.INVALID_TYPE,
      path: [...context.path],
      expectedType: supportedTypes,
      receivedType: receivedType,
    })
    return { success: false }
  }
}
