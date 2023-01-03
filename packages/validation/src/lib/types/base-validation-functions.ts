import { ParsingContext } from "../parsing-context"
import { LuftType } from "./base-type"
import { getTypeOf } from "@luftschloss/common"

export const logDeprecated = (data: unknown, context: ParsingContext, validator: LuftType) => {
  console.log(`Detected deprecated usage of ${getTypeOf(validator)} at`, context.path)
  return { action: "continue", data: data } as const
}

export const returnDefault = (data: unknown, context: ParsingContext, validator: LuftType) => {
  if ((data === undefined || data === null) && validator.validationStorage.default.isSet) {
    return {
      action: "break",
      data: validator.validationStorage.default.value,
    } as const
  }
  return { action: "continue", data } as const
}
