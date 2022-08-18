import { LuftInfer, LuftTuple, LuftType } from "@luftschloss/validation"
import { fakeAll } from "./all"

export const fakeTuple = <T extends LuftTuple<ReadonlyArray<LuftType>>>(
  validator: T,
  filedName?: string
): LuftInfer<T> => {
  return validator.schema.types.map(type => fakeAll(type, filedName)) as LuftInfer<T>
}
