import { LuftUndefined } from "@luftschloss/validation"
import { GeneratedSchema, toGeneratedSchema } from "./type"

export const generateUndefinedJsonSchema = (type: LuftUndefined, schemaPath: string): GeneratedSchema =>
  toGeneratedSchema(type, { type: "null" }, schemaPath, {})
