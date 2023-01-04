import { faker } from "@faker-js/faker";
import { LuftInfer, LuftType, LuftUnion } from "@luftschloss/validation";
import { mockAll } from "./all";

export const mockUnion = <T extends LuftUnion<ReadonlyArray<LuftType>>>(
  validator: T,
  filedName?: string
): LuftInfer<T> => {
  const pickedType = faker.helpers.arrayElement(validator.schema.types);
  return mockAll(pickedType, filedName);
};
