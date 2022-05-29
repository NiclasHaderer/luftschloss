/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { getTypeOf, toListString, uniqueList } from "../helpers"
import { LuftParsingError, ParsingIssue } from "../parsing-error"
import { LuftTypeOf } from "../types"

type InternalParsingResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
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

class ParsingContext {
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

export abstract class LuftBaseType<OUT_TYPE> {
  public readonly schema: unknown
  public abstract readonly supportedTypes: string[]

  public validate(data: unknown): OUT_TYPE {
    const result = this.validateSave(data)
    if (result.success) {
      return result.data
    }
    throw new LuftParsingError(result.issues)
  }

  public validateSave(data: unknown): ParsingResult<OUT_TYPE> {
    const context = new ParsingContext()
    const resultData = this._validate(data, context)

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
      "Context has issues, but the parsing result is marked as a result. Please check you parsers for errors"
    )
  }

  protected abstract _validate(data: unknown, context: ParsingContext): InternalParsingResult<OUT_TYPE>

  public coerce(data: unknown): OUT_TYPE {
    const result = this.validateSave(data)
    if (result.success) {
      return result.data
    }
    throw new LuftParsingError(result.issues)
  }

  public coerceSave(data: unknown): ParsingResult<OUT_TYPE> {
    const context = new ParsingContext()
    const resultData = this._coerce(data, context)

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
      "Context has issues, but the parsing result is marked as a result. Please check you parsers for errors"
    )
  }

  protected abstract _coerce(data: unknown, context: ParsingContext): InternalParsingResult<OUT_TYPE>

  public optional() {
    return new LuftUndefined<OUT_TYPE>(this)
  }

  public nullable() {
    return new LuftNull<OUT_TYPE>(this)
  }

  public nullish(): LuftNull<LuftTypeOf<LuftUndefined<OUT_TYPE>>> {
    const optional = new LuftUndefined<OUT_TYPE>(this)
    return new LuftNull<LuftTypeOf<typeof optional>>(optional)
  }

  public required() {
    // TODO try to get the real not optional type
    //eslint-disable-next-line @typescript-eslint/no-this-alias
    let type: LuftBaseType<unknown> = this
    while (type instanceof LuftUndefined || type instanceof LuftNull) {
      type = type.schema
    }

    return type
  }

  public or<T extends LuftBaseType<unknown>>(type: LuftBaseType<T>): LuftUnion<[T, this]> {
    return new LuftUnion(this, type)
  }

  public default() {
    // TODO check weather the underlying schema is optional and if yes throw an error
  }

  public beforeValidate() {
    // TODO think about separating coercing logic into own method and use this as read only hooks
    // TODO call and give an option to add custom errors and mutate the passed data
  }

  public afterValidate() {
    // TODO think about separating transformation logic into own method and use this as read only hooks
    // TODO call and give an option to add custom errors and mutate the passed data
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
    const cb = mode === "validate" ? schema._coerce.bind(this) : schema._validate.bind(this)
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
    const cb = mode === "validate" ? schema._coerce.bind(this) : schema._validate.bind(this)
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
      const cb = mode === "validate" ? validator._coerce.bind(this) : validator._validate.bind(this)

      const result = cb(data, context)
      if (result.success) return result
    }

    const supportedTypes = this.supportedTypes
    const receivedType = getTypeOf(data)
    context.addIssue({
      message: `Expected one of the supported types ${toListString(supportedTypes)}, but got ${receivedType}`,
      code: "INVALID_UNION",
      path: [...context.path],
      expectedType: supportedTypes,
      receivedType: receivedType,
    })
    return { success: false }
  }
}
