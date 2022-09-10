import { faker } from "@faker-js/faker"
import { LuftInfer, LuftInt } from "@luftschloss/validation"

export const mockInt = (validator: LuftInt): LuftInfer<LuftInt> => {
  const inclusiveMax = validator.schema.maxCompare === "<="
  const inclusiveMin = validator.schema.minCompare === ">="

  const min = validator.schema.min
  const max = validator.schema.max

  return faker.datatype.number({
    min: inclusiveMin ? min : min !== undefined ? min + 1 : min,
    max: inclusiveMax ? max : max !== undefined ? max - 1 : max,
    precision: 1,
  })
}
