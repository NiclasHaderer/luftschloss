import { LuftArray, LuftType } from "@luftschloss/validation"
import { ArraySchema } from "../types"
import { GeneratedSchema, toGeneratedSchema } from "./type"
import { generateJsonSchema } from "./all"

export const generateArrayJsonSchema = (type: LuftArray<LuftType>, schemaPath: string): GeneratedSchema => {
  const subSchemas = generateJsonSchema(type.schema.type, schemaPath)
  const arraySchema: ArraySchema = { type: "array", items: subSchemas.root }

  if (type.schema.unique) {
    arraySchema.uniqueItems = true
  }

  if (type.schema.maxLength !== undefined) {
    arraySchema.maxItems = type.schema.maxLength
  }

  if (type.schema.minLength !== undefined) {
    arraySchema.minItems = type.schema.minLength
  }

  return toGeneratedSchema(type, arraySchema, schemaPath, subSchemas.named)
}
