import { LuftInfer, LuftNumber } from "@luftschloss/validation"
import { faker } from "@faker-js/faker"

export const mockNumber = (validator: LuftNumber): LuftInfer<LuftNumber> => {
  const inclusiveMax = validator.schema.maxCompare === "<="
  const inclusiveMin = validator.schema.minCompare === ">="

  const min = validator.schema.min
  const max = validator.schema.max

  return faker.datatype.number({
    min: inclusiveMin ? min : min !== undefined ? min + 0.01 : min,
    max: inclusiveMax ? max : max !== undefined ? max - 0.01 : max,
    precision: 0.01,
  })
}
