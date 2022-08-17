import { LuftInfer, LuftNumber } from "@luftschloss/validation"
import { faker } from "@faker-js/faker"

export const fakeNumber = (validator: LuftNumber): LuftInfer<LuftNumber> => {
  const inclusiveMax = validator.schema.maxCompare === "<="
  const inclusiveMin = validator.schema.minCompare === ">="
  return faker.datatype.number({
    min: inclusiveMin ? validator.schema.min : validator.schema.min + 1,
    max: inclusiveMax ? validator.schema.max : validator.schema.max - 1,
    precision: Math.random(),
  })
}
