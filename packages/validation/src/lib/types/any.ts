/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalParsingResult, LuftBaseType } from "./base-type"
import { ParsingContext } from "../parsing-context"

export class LuftAny extends LuftBaseType<any> {
  readonly supportedTypes = ["any"]
  public readonly schema = {}

  public clone(): LuftAny {
    return new LuftAny().beforeCoerce(true, ...this.beforeCoerceHooks).beforeValidate(true, ...this.beforeValidateHooks)
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<any> {
    return {
      success: true,
      data,
    }
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<any> {
    return {
      success: true,
      data,
    }
  }
}
