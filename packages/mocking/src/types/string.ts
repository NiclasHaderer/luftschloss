import { LuftInfer, LuftString } from "@luftschloss/validation"
import { randomRange } from "@luftschloss/core"
import { faker } from "@faker-js/faker"

const trimUntilFits = (stringToReturn: string, min: number) => {
  stringToReturn = stringToReturn.trim()
  if (stringToReturn.length < min) {
    stringToReturn = stringToReturn + faker.datatype.string(min - stringToReturn.length)
  }
  return stringToReturn
}

export const fakeString = (validator: LuftString): LuftInfer<LuftString> => {
  const min = validator.schema.minLength < 0 ? 0 : validator.schema.minLength
  const max = validator.schema.maxLength === Infinity ? Math.max(1000, min + 1000) : validator.schema.maxLength
  const length = Math.round(randomRange(min, max))
  let stringToReturn = faker.datatype.string(length)
  if (validator.schema.trim) {
    stringToReturn = trimUntilFits(stringToReturn, min)
  }
  return stringToReturn
}
