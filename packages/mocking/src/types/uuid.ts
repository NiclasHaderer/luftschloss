import { LuftInfer, LuftUUIDString } from "@luftschloss/validation";
import { faker } from "@faker-js/faker";

export const mockUUID = (): LuftInfer<LuftUUIDString> => faker.datatype.uuid();
