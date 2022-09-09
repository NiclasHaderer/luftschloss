import { LuftAny } from "@luftschloss/validation"
import { toGeneratedSchema } from "./type"

export const generateAnyJsonSchema = (type: LuftAny, schemaPath: string) =>
  toGeneratedSchema(type, true, schemaPath, {})
