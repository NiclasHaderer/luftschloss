import { LuftInfer, LuftTuple, LuftType } from "@luftschloss/validation";
import { mockAll } from "./all";

export const mockTuple = <T extends LuftTuple<ReadonlyArray<LuftType>>>(
  validator: T,
  filedName?: string
): LuftInfer<T> => {
  return validator.schema.types.map(type => mockAll(type, filedName)) as LuftInfer<T>;
};
