import { LuftArray, LuftType } from "@luftschloss/validation"
import { ArraySchema } from "../types"
import { generateJsonSchema } from "./all"

export const generateArrayJsonSchema = (type: LuftArray<LuftType>): ArraySchema => {
  const arraySchema: ArraySchema = { type: "array", items: generateJsonSchema(type.schema.type) }
  if (type.schema.unique) {
    arraySchema.uniqueItems = true
  }

  if (type.schema.maxLength !== undefined) {
    arraySchema.maxItems = type.schema.maxLength
  }

  if (type.schema.minLength !== undefined) {
    arraySchema.minItems = type.schema.minLength
  }

  return arraySchema
}
