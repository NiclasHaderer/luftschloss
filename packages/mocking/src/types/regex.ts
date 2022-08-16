import { LuftInfer, LuftRegexp } from "@luftschloss/validation"
import { faker } from "@faker-js/faker"

export const fakeRegex = (validator: LuftRegexp): LuftInfer<LuftRegexp> =>
  // TODO string length
  faker.helpers.regexpStyleStringParse(validator.schema.regex.source)
