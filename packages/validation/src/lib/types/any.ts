/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalParsingResult, LuftType } from "./base-type"
import { ParsingContext } from "../parsing-context"
import { deepCopy } from "@luftschloss/common"

export class LuftAny extends LuftType<any> {
  readonly supportedTypes = ["any"]
  public readonly schema = {}

  public clone(): LuftAny {
    return new LuftAny().replaceValidationStorage(deepCopy(this.validationStorage))
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<any> {
    return {
      success: true,
      data,
      usedValidator: this,
    }
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<any> {
    return {
      success: true,
      data,
      usedValidator: this,
    }
  }
}
