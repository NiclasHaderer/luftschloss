/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { uniqueList } from "@luftschloss/core"
import { createInvalidTypeIssue, getTypeOf } from "../helpers"
import { ParsingContext } from "../parsing-context"
import { LuftErrorCodes, LuftParsingError, LuftParsingUsageError, ParsingError } from "../parsing-error"

export type LuftType = LuftBaseType<never> | LuftBaseType<any>
export type LuftInfer<T extends LuftType> = T extends LuftBaseType<infer U> ? U : never

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

const NO_DEFAULT = Symbol("NO_DEFAULT")

export interface LuftValidationStorage<T> {
  beforeValidateHooks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]
  beforeCoerceHooks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]
  afterValidateHooks: ((data: T, context: ParsingContext) => InternalParsingResult<T>)[]
  afterCoerceHooks: ((data: T, context: ParsingContext) => InternalParsingResult<T>)[]
  defaultValue: T | typeof NO_DEFAULT
  deprecated: boolean
  description: string | undefined
}

export type InternalLuftBaseType<OUT_TYPE> = {
  _validate(data: unknown, context: ParsingContext): InternalParsingResult<OUT_TYPE>

  _coerce(data: unknown, context: ParsingContext): InternalParsingResult<OUT_TYPE>
} & LuftBaseType<OUT_TYPE>

export abstract class LuftBaseType<RETURN_TYPE> {
  public abstract readonly schema: Record<string, unknown>
  public abstract readonly supportedTypes: string[]

  private _validationStorage: LuftValidationStorage<RETURN_TYPE> = {
    beforeValidateHooks: [],
    beforeCoerceHooks: [],
    afterValidateHooks: [],
    afterCoerceHooks: [],
    defaultValue: NO_DEFAULT,
    deprecated: false,
    description: undefined,
  }

  public get validationStorage() {
    return this._validationStorage
  }

  /**
   * @internal
   */
  public replaceValidationStorage(newValidationStorage: LuftValidationStorage<RETURN_TYPE>): this {
    this._validationStorage = newValidationStorage
    return this
  }

  protected abstract _validate(data: unknown, context: ParsingContext): InternalParsingResult<RETURN_TYPE>

  protected abstract _coerce(data: unknown, context: ParsingContext): InternalParsingResult<RETURN_TYPE>

  public abstract clone(): LuftBaseType<RETURN_TYPE>

  public deprecated(deprecated: boolean): this {
    const copy = this.clone()
    copy.validationStorage.deprecated = deprecated
    copy.before(copy.logDeprecated)
    return copy as this
  }

  public description(description: string): this {
    const copy = this.clone()
    copy.validationStorage.description = description
    return copy as this
  }

  public validate(data: unknown): RETURN_TYPE {
    const result = this.validateSave(data)
    if (result.success) {
      return result.data
    }
    throw new LuftParsingError(result.issues, `Could not validate data \n${result.issues.join("\n")}`)
  }

  public validateSave(data: unknown): ParsingResult<RETURN_TYPE> {
    const context = new ParsingContext()

    let resultData: InternalParsingResult<RETURN_TYPE> | undefined = undefined
    for (const validateBeforeHook of this.validationStorage.beforeValidateHooks) {
      const result = validateBeforeHook(data, context)
      if (result.success) {
        data = result.data
      } else {
        resultData = result
        break
      }
    }

    // If resultData is set here we know that there has already been an error, and we can return early
    if (resultData) {
      return this.checkDataAndReturn(context, resultData)
    }

    resultData = this._validate(data, context)
    if (resultData.success) {
      for (const validateAfterHook of this.validationStorage.afterValidateHooks) {
        resultData = validateAfterHook(resultData.data, context)
        // If there is an error return early
        if (!resultData.success) break
      }
    }

    return this.checkDataAndReturn(context, resultData)
  }

  public coerce(data: unknown): RETURN_TYPE {
    const result = this.coerceSave(data)
    if (result.success) {
      return result.data
    }
    throw new LuftParsingError(result.issues, `Could not coerce data \n${result.issues.join("\n")}`)
  }

  public coerceSave(data: unknown): ParsingResult<RETURN_TYPE> {
    const context = new ParsingContext()

    let resultData: InternalParsingResult<RETURN_TYPE> | undefined = undefined
    for (const coerceBeforeHook of this.validationStorage.beforeCoerceHooks) {
      const result = coerceBeforeHook(data, context)
      if (result.success) {
        data = result.data
      } else {
        resultData = result
        break
      }
    }

    // If resultData is set here we know that there has already been an error, and we can return early
    if (resultData) {
      return this.checkDataAndReturn(context, resultData)
    }

    resultData = this._coerce(data, context)
    if (resultData.success) {
      for (const coerceAfterHook of this.validationStorage.afterCoerceHooks) {
        resultData = coerceAfterHook(resultData.data, context)
        // If there is an error return early
        if (!resultData.success) break
      }
    }

    return this.checkDataAndReturn(context, resultData)
  }

  private checkDataAndReturn(
    context: ParsingContext,
    resultData: InternalParsingResult<RETURN_TYPE>
  ): ParsingResult<RETURN_TYPE> {
    // Issues, but no success
    if (context.hasIssues && resultData.success) {
      throw new LuftParsingUsageError(
        "Context has issues, but the parsing result is marked as valid. Please check if your parser added issues if he returned false"
      )
    }
    // No success, but also no issues
    else if (!context.hasIssues && !resultData.success) {
      throw new LuftParsingUsageError(
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

  public optional(): LuftUnion<[this, LuftUndefined]> {
    return new LuftUnion({ types: [this.clone(), new LuftUndefined()] }) as LuftUnion<[this, LuftUndefined]>
  }

  public nullable(): LuftUnion<[this, LuftNull]> {
    return new LuftUnion({ types: [this.clone(), new LuftNull()] }) as LuftUnion<[this, LuftNull]>
  }

  public nullish(): LuftUnion<[this, LuftNull, LuftUndefined]> {
    return new LuftUnion({ types: [this.clone(), new LuftNull(), new LuftUndefined()] }) as LuftUnion<
      [this, LuftNull, LuftUndefined]
    >
  }

  public or<T extends LuftType>(type: T): LuftUnion<(T | this)[]> {
    return new LuftUnion({ types: [this.clone(), type] }) as LuftUnion<(T | this)[]>
  }

  public default(defaultValue: RETURN_TYPE): this {
    const copy = this.clone()
    copy.validationStorage.defaultValue = defaultValue
    return copy.before(copy.returnDefault) as this
  }

  public before(...callbacks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]): this {
    return this.beforeValidate(...callbacks).beforeCoerce(...callbacks)
  }

  public beforeValidate(
    ...callbacks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]
  ): this {
    const copy = this.clone()

    for (const cb of callbacks) {
      const hasCb = copy.validationStorage.beforeValidateHooks.includes(cb)
      if (!hasCb) this.validationStorage.beforeValidateHooks.push(cb)
    }

    return copy as this
  }

  public beforeCoerce(
    ...callbacks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]
  ): this {
    const copy = this.clone()

    for (const cb of callbacks) {
      const hasCb = copy.validationStorage.beforeCoerceHooks.includes(cb)
      if (!hasCb) this.validationStorage.beforeCoerceHooks.push(cb)
    }
    return copy as this
  }

  public after(
    ...callbacks: ((value: RETURN_TYPE, context: ParsingContext) => InternalParsingResult<RETURN_TYPE>)[]
  ): this {
    return this.afterValidate(...callbacks).afterCoerce(...callbacks)
  }

  public afterValidate(
    ...callbacks: ((value: RETURN_TYPE, context: ParsingContext) => InternalParsingResult<RETURN_TYPE>)[]
  ): this {
    const copy = this.clone()

    for (const cb of callbacks) {
      const hasCb = copy.validationStorage.afterValidateHooks.includes(cb)
      if (!hasCb) this.validationStorage.afterValidateHooks.push(cb)
    }
    return copy as this
  }

  public afterCoerce(
    ...callbacks: ((value: RETURN_TYPE, context: ParsingContext) => InternalParsingResult<RETURN_TYPE>)[]
  ): this {
    const copy = this.clone()

    for (const cb of callbacks) {
      const hasCb = copy.validationStorage.afterCoerceHooks.includes(cb)
      if (!hasCb) this.validationStorage.afterCoerceHooks.push(cb)
    }
    return copy as this
  }

  private logDeprecated(value: unknown, context: ParsingContext): InternalParsingResult<unknown> {
    console.log("Usage of deprecated type at", context.path)
    return { success: true, data: value }
  }

  private returnDefault = (coerceValue: unknown): InternalParsingResult<unknown> => {
    if (coerceValue === undefined || coerceValue === null) {
      return {
        success: true,
        data: this.validationStorage.defaultValue,
      }
    }
    return { success: true, data: coerceValue }
  }
}

export class LuftUndefined extends LuftBaseType<undefined> {
  public readonly schema = {}

  public supportedTypes = ["undefined"]

  public clone(): LuftUndefined {
    return new LuftUndefined().replaceValidationStorage(this.validationStorage)
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
    return new LuftNull().replaceValidationStorage(this.validationStorage)
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

export class LuftUnion<T extends ReadonlyArray<LuftType>> extends LuftBaseType<LuftInfer<T[number]>> {
  public constructor(public readonly schema: { types: T }) {
    super()
  }

  public clone(): LuftUnion<T> {
    return new LuftUnion({
      types: this.schema.types.map(type => type.clone()) as unknown as T,
    }).replaceValidationStorage(this.validationStorage)
  }

  public get supportedTypes() {
    return uniqueList(this.schema.types.flatMap(s => s.supportedTypes))
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<LuftInfer<T[number]>> {
    return this._validate(data, context, "_coerce")
  }

  protected _validate(
    data: unknown,
    context: ParsingContext,
    mode: "_validate" | "_coerce" = "_validate"
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
