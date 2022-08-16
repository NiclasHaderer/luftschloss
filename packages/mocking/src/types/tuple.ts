import { LuftBaseType, LuftInfer, LuftTuple } from "@luftschloss/validation"
import { fakeAll } from "./all"

export const fakeTuple = <T extends LuftTuple<LuftBaseType<any>[]>>(validator: T): LuftInfer<T> => {
  return validator.schema.types.map(type => fakeAll(type)) as LuftInfer<T>
}
