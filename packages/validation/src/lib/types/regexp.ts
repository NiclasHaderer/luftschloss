/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { createInvalidTypeIssue } from "../helpers"
import { ParsingContext } from "../parsing-context"
import { InternalParsingResult, LuftBaseType } from "./base-type"

export class LuftRegexp extends LuftBaseType<string> {
  public constructor(public override readonly schema: { regex: RegExp }) {
    super()
  }

  public get supportedTypes() {
    return [`/${this.schema.regex.source}/${this.schema.regex.flags}`, "string"]
  }

  public clone(): LuftRegexp {
    return new LuftRegexp({ regex: new RegExp(this.schema.regex.source, this.schema.regex.flags) })
      .beforeCoerce(true, ...this.beforeCoerceHooks)
      .beforeValidate(true, ...this.beforeValidateHooks)
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    return this._validate(data, context)
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    if (typeof data !== "string") {
      context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
      return {
        success: false,
      }
    }

    const matches = this.schema.regex.test(data)
    if (matches) {
      return {
        success: true,
        data,
      }
    }

    context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
    return {
      success: false,
    }
  }
}
