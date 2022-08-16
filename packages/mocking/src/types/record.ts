import { LuftBaseType, LuftInfer, LuftRecord, LuftRecordKey } from "@luftschloss/validation"
import { randomRange, saveObject } from "@luftschloss/core"
import { fakeAll } from "./all"

export const fakeRecord = <T extends LuftRecord<LuftRecordKey, LuftBaseType<any>>>(validator: T): LuftInfer<T> => {
  const size = Math.round(randomRange(1, 30))
  const record = saveObject<LuftInfer<T>>()
  for (let i = 0; i < size; i++) {
    const key = fakeAll(validator.schema.key) as keyof LuftInfer<T>
    record[key] = fakeAll(validator.schema.value)
  }
  return record
}
