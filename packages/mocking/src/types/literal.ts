import { LuftInfer, LuftLiteral } from "@luftschloss/validation"
import { faker } from "@faker-js/faker"

export const mockLiteral = <T extends LuftLiteral<any>>(validator: T): LuftInfer<T> =>
  faker.helpers.arrayElement(validator.schema.types)
