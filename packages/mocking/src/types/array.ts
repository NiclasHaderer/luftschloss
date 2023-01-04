import { randomRange } from "@luftschloss/common";
import { LuftArray, LuftInfer, LuftType } from "@luftschloss/validation";
import { mockAll } from "./all";

export const mockArray = <T extends LuftArray<LuftType>>(validator: T, filedName?: string): LuftInfer<T> => {
  const min = validator.schema.minLength ?? 0;
  const max = Math.min(validator.schema.maxLength ?? 20, min + 20);
  const length = Math.round(randomRange(min, max));

  return new Array(length).fill(null).map(() => mockAll(validator.schema.type, filedName)) as LuftInfer<T>;
};
