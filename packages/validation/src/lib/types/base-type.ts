/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { uniqueList } from "@luftschloss/core"
import { createInvalidTypeIssue, getTypeOf } from "../helpers"
import { LuftInfer } from "../infer"
import { ParsingContext } from "../parsing-context"
import { LuftErrorCodes, LuftParsingError, ParsingError } from "../parsing-error"

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

  protected beforeValidateHooks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[] = []
  protected beforeCoerceHooks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[] = []

  protected abstract _validate(data: unknown, context: ParsingContext): InternalParsingResult<RETURN_TYPE>

  protected abstract _coerce(data: unknown, context: ParsingContext): InternalParsingResult<RETURN_TYPE>

  public abstract clone(): LuftBaseType<RETURN_TYPE>

  public validate(data: unknown): RETURN_TYPE {
    const result = this.validateSave(data)
    if (result.success) {
      return result.data
    }
    throw new LuftParsingError(result.issues, "Could not validate data")
  }

  public validateSave(data: unknown): ParsingResult<RETURN_TYPE> {
    const context = new ParsingContext()

    for (const validateBeforeHook of this.beforeValidateHooks) {
      const result = validateBeforeHook(data, context)
      if (result.success) {
        data = result.data
      } else {
        return {
          success: false,
          issues: context.issues,
        }
      }
    }

    const resultData = this._validate(data, context)
    return this.checkDataAndReturn(context, resultData)
  }

  public coerce(data: unknown): RETURN_TYPE {
    const result = this.coerceSave(data)
    if (result.success) {
      return result.data
    }
    throw new LuftParsingError(result.issues, "Could not coerce data")
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

    const resultData = this._coerce(data, context)
    return this.checkDataAndReturn(context, resultData)
  }

  private checkDataAndReturn(
    context: ParsingContext,
    resultData: InternalParsingResult<RETURN_TYPE>
  ): ParsingResult<RETURN_TYPE> {
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

  public or<T extends LuftBaseType<unknown>>(type: T): LuftUnion<(T | this)[]> {
    return new LuftUnion({ types: [this.clone(), type] }) as LuftUnion<(T | this)[]>
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

    let newValidator = this.beforeValidate(addDefaultFun)
    newValidator = newValidator.beforeCoerce(addDefaultFun)
    return newValidator
  }

  public beforeValidate(
    ...callbacks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]
  ): this
  public beforeValidate(
    dontClone: boolean,
    ...callbacks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]
  ): this
  public beforeValidate(
    ...data:
      | ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]
      | [boolean, ...((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]]
  ): this {
    return this.addHook(data, "beforeValidateHooks")
  }

  public beforeCoerce(
    ...callbacks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]
  ): this
  public beforeCoerce(
    dontClone: boolean,
    ...callbacks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]
  ): this
  public beforeCoerce(
    ...data:
      | ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]
      | [boolean, ...((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]]
  ): this {
    return this.addHook(data, "beforeCoerceHooks")
  }

  private addHook(
    data:
      | ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]
      | [boolean, ...((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]],
    hookType: "beforeValidateHooks" | "beforeCoerceHooks"
  ): this {
    //eslint-disable-next-line @typescript-eslint/no-this-alias
    let self = this
    let callbacks: ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]
    if (typeof data[0] === "boolean") {
      callbacks = data.slice(1) as ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]
      const dontClone = data[0]
      if (dontClone == false) {
        self = self.clone() as this
      }
    } else {
      callbacks = data as ((value: unknown, context: ParsingContext) => InternalParsingResult<unknown>)[]
      self = self.clone() as this
    }

    self[hookType].push(...callbacks)
    return self
  }
}

export class LuftUndefined extends LuftBaseType<undefined> {
  public readonly schema = {}

  public supportedTypes = ["undefined"]

  public clone(): LuftUndefined {
    return new LuftUndefined()
      .beforeCoerce(true, ...this.beforeCoerceHooks)
      .beforeValidate(true, ...this.beforeValidateHooks)
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
      .beforeCoerce(true, ...this.beforeCoerceHooks)
      .beforeValidate(true, ...this.beforeValidateHooks)
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
      .beforeCoerce(true, ...this.beforeCoerceHooks)
      .beforeValidate(true, ...this.beforeValidateHooks)
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
