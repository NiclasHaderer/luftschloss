import { randomRange, saveObject } from "@luftschloss/common"
import { LuftInfer, LuftRecord, LuftRecordKey, LuftType } from "@luftschloss/validation"
import { mockAll } from "./all"

export const mockRecord = <T extends LuftRecord<LuftRecordKey, LuftType>>(validator: T): LuftInfer<T> => {
  const min = validator.schema.minProperties ?? 0
  const max = Math.min(validator.schema.maxProperties ?? 30, min + 30)
  const size = Math.round(randomRange(min, max))

  const record = saveObject<LuftInfer<T>>()
  for (let i = 0; i < size; i++) {
    const key = mockAll(validator.schema.key) as keyof LuftInfer<T>
    record[key] = mockAll(validator.schema.value)
  }
  return record
}
