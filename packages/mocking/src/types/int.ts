import { faker } from "@faker-js/faker"
import { LuftInfer, LuftInt } from "@luftschloss/validation"

export const fakeInt = (validator: LuftInt): LuftInfer<LuftInt> => {
  const inclusiveMax = validator.schema.maxCompare === "<="
  const inclusiveMin = validator.schema.minCompare === ">="

  const min = validator.schema.min === -Infinity ? -Number.MAX_SAFE_INTEGER : validator.schema.min
  const max = validator.schema.max === Infinity ? Number.MAX_SAFE_INTEGER : validator.schema.max

  return faker.datatype.number({
    min: inclusiveMin ? min : min + 1,
    max: inclusiveMax ? max : max - 1,
    precision: 1,
  })
}
