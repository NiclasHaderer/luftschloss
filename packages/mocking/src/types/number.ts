import { LuftInfer, LuftNumber } from "@luftschloss/validation"
import { faker } from "@faker-js/faker"

export const fakeNumber = (validator: LuftNumber): LuftInfer<LuftNumber> => {
  const inclusiveMax = validator.schema.maxCompare === "<="
  const inclusiveMin = validator.schema.minCompare === ">="

  const min = validator.schema.min === -Infinity ? -Number.MAX_SAFE_INTEGER : validator.schema.min
  const max = validator.schema.max === Infinity ? Number.MAX_SAFE_INTEGER : validator.schema.max

  return faker.datatype.number({
    min: inclusiveMin ? min : min + 1,
    max: inclusiveMax ? max : max - 1,
    precision: Math.random(),
  })
}
