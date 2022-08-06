/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftAny extends LuftBaseType<any> {
  readonly supportedTypes = ["any"]
  protected returnType: any
  public readonly schema = {}

  public clone(): LuftAny {
    return new LuftAny()
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
