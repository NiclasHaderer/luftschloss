/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { InternalParsingResult, LuftBaseType } from "./base-type"
import { createInvalidTypeIssue } from "../helpers"
import { ParsingContext } from "../parsing-context"
import { deepCopy } from "@luftschloss/core"

export class LuftNever extends LuftBaseType<never> {
  readonly supportedTypes = ["never"]
  public readonly schema = {}

  public clone(): LuftNever {
    return new LuftNever().replaceValidationStorage(deepCopy(this.validationStorage))
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<never> {
    context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
    return {
      success: false,
    }
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<never> {
    context.addIssue(createInvalidTypeIssue(data, this.supportedTypes, context))
    return {
      success: false,
    }
  }
}
