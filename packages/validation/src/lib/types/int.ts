/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { createInvalidTypeIssue } from "../helpers"
import { LuftErrorCodes } from "../parsing-error"
import { InternalParsingResult } from "./base-type"
import { LuftNumber } from "./number"
import { ParsingContext } from "../parsing-context"

type LuftIntSchema = {
  min: number
  max: number
  allowNan: boolean
  minCompare: ">=" | ">"
  maxCompare: "<=" | "<"
  roundWith: "floor" | "ceil" | "trunc" | "round"
}

export class LuftInt extends LuftNumber {
  public readonly supportedTypes = ["int"]
  public override readonly schema: LuftIntSchema

  constructor(
    schema: LuftIntSchema = {
      min: -Infinity,
      max: Infinity,
      allowNan: false,
      minCompare: ">=",
      maxCompare: "<=",
      roundWith: "round",
    }
  ) {
    super()
    this.schema = schema
  }

  public clone(): LuftInt {
    return new LuftInt({ ...this.schema })
  }

  protected _coerce(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    if (typeof data === "string") {
      data = parseFloat(data)
    }
    if (typeof data === "number" && data % 1 !== 0) {
      data = Math[this.schema.roundWith](data)
    }

    return this._validate(data, context)
  }

  public roundWith(mode: "floor" | "ceil" | "trunc" | "round"): LuftInt {
    this.schema.roundWith = mode
    return this
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<number> {
    const result = super._validate(data, context)
    if (!result.success) return result

    // Is a float number
    if (result.data % 1 !== 0) {
      context.addIssue(createInvalidTypeIssue(LuftErrorCodes.INVALID_TYPE, this.supportedTypes, context))
      return { success: false }
    }
    return result
  }
}
