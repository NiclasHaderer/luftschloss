import { randomRange } from "@luftschloss/common"
import { LuftArray, LuftInfer, LuftType } from "@luftschloss/validation"
import { fakeAll } from "./all"

export const fakeArray = <T extends LuftArray<LuftType>>(validator: T, filedName?: string): LuftInfer<T> => {
  const min = validator.schema.minLength < 0 ? 0 : validator.schema.minLength
  const max = validator.schema.maxLength === Infinity ? Math.max(100, min + 100) : validator.schema.maxLength
  const length = Math.round(randomRange(min, max))
  return new Array(length).fill(null).map(() => fakeAll(validator.schema.type, filedName)) as LuftInfer<T>
}
