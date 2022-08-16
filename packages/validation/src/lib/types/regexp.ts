/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { createInvalidTypeIssue } from "../helpers"
import { ParsingContext } from "../parsing-context"
import { InternalParsingResult } from "./base-type"
import { LuftString } from "./string"

export class LuftRegexp extends LuftString {
  public readonly schema: { regex: RegExp; minLength: number; maxLength: number; trim: boolean }

  public constructor({
    regex,
    minLength = -Infinity,
    maxLength = Infinity,
    trim = false,
  }: {
    regex: RegExp
    minLength?: number
    maxLength?: number
    trim?: boolean
  }) {
    super({ trim, maxLength, minLength })
    this.schema = { regex, minLength, maxLength, trim }
  }

  public get supportedTypes() {
    return [`/${this.schema.regex.source}/${this.schema.regex.flags}`, "string"]
  }

  public set supportedTypes(_: string[]) {
    // Only reading is supported
  }

  public clone(): LuftRegexp {
    return new LuftRegexp({ ...this.schema, regex: new RegExp(this.schema.regex.source, this.schema.regex.flags) })
      .beforeCoerce(true, ...this.beforeCoerceHooks)
      .beforeValidate(true, ...this.beforeValidateHooks)
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    return super._coerce(data, context)
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    const result = super._validate(data, context)
    if (!result.success) return result

    const matches = this.schema.regex.test(result.data)
    if (matches) {
      return {
        success: true,
        data: result.data,
      }
    }

    context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
    return {
      success: false,
    }
  }
}
