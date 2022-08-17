import { LuftInfer, LuftTuple, LuftType } from "@luftschloss/validation"
import { fakeAll } from "./all"

export const fakeTuple = <T extends LuftTuple<ReadonlyArray<LuftType>>>(validator: T): LuftInfer<T> => {
  return validator.schema.types.map(type => fakeAll(type)) as LuftInfer<T>
}
