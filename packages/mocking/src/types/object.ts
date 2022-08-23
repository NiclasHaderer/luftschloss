import { saveObject } from "@luftschloss/common"
import { LuftInfer, LuftObject, LuftType } from "@luftschloss/validation"
import { mockAll } from "./all"

export const mockObject = <T extends LuftObject<{ [key: string]: LuftType }>>(validator: T): LuftInfer<T> => {
  const object = saveObject<LuftInfer<T>>()
  for (const [key, value] of Object.entries(validator.schema.type)) {
    object[key as keyof LuftInfer<T>] = mockAll(value, key)
  }
  return object
}
