import { LuftString } from "@luftschloss/validation"
import { StringSchema } from "../types"
import { GeneratedSchema, toGeneratedSchema } from "./type"

export const generateStringJsonSchema = (type: LuftString, schemaPath: string): GeneratedSchema => {
  const stringSchema: StringSchema = {
    type: "string",
  }
  if (type.schema.minLength) {
    stringSchema.minLength = type.schema.minLength
  }

  if (type.schema.maxLength) {
    stringSchema.maxLength = type.schema.maxLength
  }

  return toGeneratedSchema(type, stringSchema, schemaPath, {})
}
