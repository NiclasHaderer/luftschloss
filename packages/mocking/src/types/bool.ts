import { LuftBool, LuftInfer } from "@luftschloss/validation"
import { faker } from "@faker-js/faker"

export const fakeBool = (_: LuftBool): LuftInfer<LuftBool> => faker.datatype.boolean()
