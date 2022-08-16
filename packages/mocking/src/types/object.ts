import { LuftBaseType, LuftInfer, LuftObject } from "@luftschloss/validation"
import { saveObject } from "@luftschloss/core"
import { fakeAll } from "./all"

export const fakeObject = <T extends LuftObject<{ [key: string]: LuftBaseType<any> }>>(validator: T): LuftInfer<T> => {
  const object = saveObject<LuftInfer<T>>()
  for (const [key, value] of Object.entries(validator.schema.type)) {
    object[key as keyof LuftInfer<T>] = fakeAll(value)
  }
  return object
}
