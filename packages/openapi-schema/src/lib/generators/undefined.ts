import { LuftUndefined } from "@luftschloss/validation"

// TODO think of a way around this
export const generateUndefinedJsonSchema = (type: LuftUndefined): never => {
  throw new Error("Undefined cannot be displayed by json schema")
}
