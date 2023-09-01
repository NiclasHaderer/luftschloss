import { ParsingContext } from "../parsing-context";
import { LuftType } from "./base-types";
import { getTypeOf } from "@luftschloss/common";

export const logDeprecated = (data: unknown, context: ParsingContext, validator: LuftType) => {
  if (!validator.validationStorage.deprecated.isSet) return { action: "continue", data } as const;
  console.log(
    `Detected deprecated usage of ${validator.validationStorage.name ?? getTypeOf(validator)} at`,
    Array.isArray(context.path) ? context.path.join(".") : context.path
  );
  if (validator.validationStorage.deprecated.message) {
    console.log(`Deprecation message: ${validator.validationStorage.deprecated.message}`);
  }
  return { action: "continue", data: data } as const;
};

export const returnDefault = (data: unknown, context: ParsingContext, validator: LuftType) => {
  if ((data === undefined || data === null) && validator.validationStorage.default.isSet) {
    return {
      action: "break",
      data: validator.validationStorage.default.value,
    } as const;
  }
  return { action: "continue", data } as const;
};
