import { LuftInfer, LuftUUIDString } from "@luftschloss/validation"
import { faker } from "@faker-js/faker"

export const mockUUID = (_: LuftUUIDString): LuftInfer<LuftUUIDString> => faker.datatype.uuid()
