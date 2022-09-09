import { LuftType, LuftUnion } from "@luftschloss/validation"
import { CommonSchema } from "../types"
import { GeneratedSchema, mergeGeneratedSchemas, toGeneratedSchema } from "./type"

export const generateUnionJsonSchema = (type: LuftUnion<LuftType[]>, schemaPath: string): GeneratedSchema => {
  const subSchemas = mergeGeneratedSchemas(type.schema.types.map(subType => subType.generateJsonSchema(schemaPath)))

  const unionSchema: CommonSchema = {
    oneOf: subSchemas.root,
  }

  return toGeneratedSchema(type, unionSchema, schemaPath, subSchemas.named)
}
