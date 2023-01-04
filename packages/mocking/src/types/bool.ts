import { LuftBool, LuftInfer } from "@luftschloss/validation";
import { faker } from "@faker-js/faker";

export const mockBool = (): LuftInfer<LuftBool> => faker.datatype.boolean();
