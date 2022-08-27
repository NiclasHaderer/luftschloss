import { LuftRegex } from "@luftschloss/validation"
import { StringSchema } from "../types"

export const generateRegexJsonSchema = (type: LuftRegex): StringSchema => {
  const stringSchema: StringSchema = {
    type: "string",
    pattern: type.schema.regex.source,
  }
  if (type.schema.minLength) {
    stringSchema.minLength = type.schema.minLength
  }

  if (type.schema.maxLength) {
    stringSchema.maxLength = type.schema.maxLength
  }

  return stringSchema
}
