import { LuftString } from "@luftschloss/validation"
import { StringSchema } from "../types"

export const generateStringJsonSchema = (type: LuftString): StringSchema => {
  const stringSchema: StringSchema = {
    type: "string",
  }
  if (type.schema.minLength) {
    stringSchema.minLength = type.schema.minLength
  }

  if (type.schema.maxLength) {
    stringSchema.maxLength = type.schema.maxLength
  }

  return stringSchema
}
