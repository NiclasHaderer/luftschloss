import { LuftDate, LuftInfer } from "@luftschloss/validation"
import { faker } from "@faker-js/faker"

export const mockDate = (validator: LuftDate): LuftInfer<LuftDate> =>
  faker.date.between((validator.schema.after ?? 0) + 1, (validator.schema.before ?? Date.now()) - 1)
