import { LuftTuple, LuftType } from "@luftschloss/validation"
import { GeneratedSchema, mergeGeneratedSchemas, toGeneratedSchema } from "./type"
import { ArraySchema } from "../types"

export const generateTupleJsonSchema = (type: LuftTuple<LuftType[]>, schemaPath: string): GeneratedSchema => {
  const subSchemas = mergeGeneratedSchemas(type.schema.types.map(subType => subType.generateJsonSchema(schemaPath)))

  const tupleSchema: ArraySchema = {
    type: "array",
    prefixItems: subSchemas.root,
  }

  return toGeneratedSchema(type, tupleSchema, schemaPath, subSchemas.named)
}
