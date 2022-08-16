import { LuftInfer, LuftUUIDString } from "@luftschloss/validation"
import { faker } from "@faker-js/faker"

export const fakeUUID = (_: LuftUUIDString): LuftInfer<LuftUUIDString> => faker.datatype.uuid()
