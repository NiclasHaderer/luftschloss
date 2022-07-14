/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { CaseInsensitiveSet } from "../CaseInsensitiveSet"
import { LuftErrorCodes } from "../parsing-error"
import { InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftLiteral<T extends (string | number)[]> extends LuftBaseType<T[number]> {
  public override readonly schema: T
  private _ignoreCase = true
  private nonSensitiveSchema: CaseInsensitiveSet<T[number]>
  private sensitiveSchema: Set<T[number]>

  public constructor(...schema: T) {
    super()
    this.schema = schema
    this.nonSensitiveSchema = new CaseInsensitiveSet(schema)
    this.sensitiveSchema = new Set(schema)
  }

  public get supportedTypes() {
    return this.schema.map(s => s.toString())
  }

  public ignoreCase(ignoreCase: boolean): LuftLiteral<T> {
    this._ignoreCase = ignoreCase
    return this
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<T[number]> {
    const result = this._validate(data, context)
    if (result.success && this._ignoreCase) {
      return {
        success: true,
        data: this.nonSensitiveSchema.getCorresponding(data as T[number]),
      }
    }
    return result
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<T[number]> {
    if (this._ignoreCase) {
      if (this.nonSensitiveSchema.has(data as T[number])) {
        return {
          success: true,
          data: data as T[number],
        }
      }
    } else if (this.sensitiveSchema.has(data as T[number])) {
      return {
        success: true,
        data: data as T[number],
      }
    }

    const valueDisplay = ((data as object | undefined)?.toString?.() as string | undefined) || "unknown"
    context.addIssue({
      code: LuftErrorCodes.INVALID_VALUE,
      message: `Could not match value ${valueDisplay} to one of ${this.schema.join(", ")}`,
      path: [...context.path],
      allowedValues: this.schema.map(v => v.toString()),
      receivedValue: valueDisplay,
    })
    return {
      success: false,
    }
  }
}
