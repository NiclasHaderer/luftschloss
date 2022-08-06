/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftNever extends LuftBaseType<never> {
  readonly supportedTypes = ["never"]
  protected returnType!: never

  public clone(): LuftNever {
    return new LuftNever()
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<never> {
    return {
      success: false,
    }
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<never> {
    return {
      success: false,
    }
  }
}
