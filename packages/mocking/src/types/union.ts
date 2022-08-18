import { faker } from "@faker-js/faker"
import { LuftInfer, LuftType, LuftUnion } from "@luftschloss/validation"
import { fakeAll } from "./all"

export const fakeUnion = <T extends LuftUnion<ReadonlyArray<LuftType>>>(
  validator: T,
  filedName?: string
): LuftInfer<T> => {
  const pickedType = faker.helpers.arrayElement(validator.schema.types)
  return fakeAll(pickedType, filedName)
}
