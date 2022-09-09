import { LuftBool } from "@luftschloss/validation"
import { GeneratedSchema, toGeneratedSchema } from "./type"

export const generateBoolJsonSchema = (type: LuftBool, schemaPath: string): GeneratedSchema =>
  toGeneratedSchema(type, { type: "boolean" }, schemaPath, {})
