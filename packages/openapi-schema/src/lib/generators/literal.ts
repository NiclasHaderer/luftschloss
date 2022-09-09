import { LuftLiteral } from "@luftschloss/validation"
import { deepCopy } from "@luftschloss/common"
import { GeneratedSchema, toGeneratedSchema } from "./type"

export const generateLiteralJsonSchema = (type: LuftLiteral<any>, schemaPath: string): GeneratedSchema =>
  toGeneratedSchema(
    type,
    {
      enum: deepCopy(type.schema.types),
    },
    schemaPath,
    {}
  )
