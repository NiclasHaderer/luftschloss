import { LuftAny, LuftInfer } from "@luftschloss/validation"
import { faker } from "@faker-js/faker"
import { StringFactories } from "./string-factory"

export const mockAny = (_: LuftAny): LuftInfer<LuftAny> => {
  const factories = [
    faker.datatype.number,
    faker.datatype.boolean,
    faker.datatype.array,
    faker.datatype.datetime,
    faker.datatype.json,
    ...Object.values(StringFactories),
  ]

  return faker.helpers.arrayElement(factories)()
}
