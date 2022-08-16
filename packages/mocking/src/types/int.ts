import { LuftInfer, LuftInt } from "@luftschloss/validation"
import { faker } from "@faker-js/faker"

export const fakeInt = (validator: LuftInt): LuftInfer<LuftInt> =>
  faker.datatype.number({
    min: validator.schema.min,
    max: validator.schema.max,
    precision: 0,
  })
