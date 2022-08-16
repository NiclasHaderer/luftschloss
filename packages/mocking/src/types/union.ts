import { LuftBaseType, LuftInfer, LuftUnion } from "@luftschloss/validation"
import { faker } from "@faker-js/faker"
import { fakeAll } from "./all"

export const fakeUnion = <T extends LuftUnion<LuftBaseType<any>[]>>(validator: T): LuftInfer<T> => {
  const pickedType = faker.helpers.arrayElement(validator.schema.types)
  return fakeAll(pickedType)
}
