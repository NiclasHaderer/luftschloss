import { saveObject } from "@luftschloss/core"
import { LuftInfer, LuftObject, LuftType } from "@luftschloss/validation"
import { fakeAll } from "./all"

export const fakeObject = <T extends LuftObject<{ [key: string]: LuftType }>>(validator: T): LuftInfer<T> => {
  const object = saveObject<LuftInfer<T>>()
  for (const [key, value] of Object.entries(validator.schema.type)) {
    object[key as keyof LuftInfer<T>] = fakeAll(value)
  }
  return object
}
