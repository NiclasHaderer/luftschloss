/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { getTypeOf } from "../helpers"
import { InternalParsingResult, LuftBaseType, ParsingContext } from "./base-type"

export class LuftRegexp extends LuftBaseType<string> {
  protected _coerce = undefined
  public readonly supportedTypes = ["string"]

  public constructor(public override readonly schema: RegExp) {
    super()
  }

  protected _validate(data: unknown, context: ParsingContext): InternalParsingResult<string> {
    if (typeof data !== "string") {
      context.addIssue({
        code: "INCOMPATIBLE_TYPE",
        message: "A regex type can only be match a string",
        path: [...context.path],
        expectedType: "string",
        receivedType: getTypeOf(data),
      })
      return {
        success: false,
      }
    }

    const matches = this.schema.test(data)
    if (matches) {
      return {
        success: true,
        data,
      }
    }

    context.addIssue({
      code: "INCOMPATIBLE_TYPE",
      message: `Expected string which matches ${this.schema.toString()}, but got ${data}`,
      path: [...context.path],
      expectedType: this.schema.toString(),
      receivedType: "string",
    })
    return {
      success: false,
    }
  }
}
