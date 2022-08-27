import { LuftLiteral } from "@luftschloss/validation"
import { EnumSchema } from "../types"
import { deepCopy } from "@luftschloss/common"

export const generateLiteralJsonSchema = (type: LuftLiteral<any>): EnumSchema => ({
  enum: deepCopy(type.schema.types),
})
