import { LuftAny, LuftInfer } from "@luftschloss/validation"
import { faker } from "@faker-js/faker"

export const fakeAny = (_: LuftAny): LuftInfer<LuftAny> => {
  const factories = [
    faker.datatype.number,
    faker.datatype.boolean,
    faker.datatype.array,
    faker.datatype.datetime,
    faker.datatype.json,
    faker.color.human,
    faker.address.city,
    faker.address.street,
    faker.company.bs,
    faker.company.catchPhrase,
    faker.company.name,
    faker.animal.type,
    faker.word.noun,
  ]

  return faker.helpers.arrayElement(factories)()
}
