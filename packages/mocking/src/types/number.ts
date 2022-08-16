import { LuftInfer, LuftNumber } from "@luftschloss/validation"
import { faker } from "@faker-js/faker"

export const fakeNumber = (validator: LuftNumber): LuftInfer<LuftNumber> =>
  faker.datatype.number({
    min: validator.schema.min,
    max: validator.schema.max,
  })
