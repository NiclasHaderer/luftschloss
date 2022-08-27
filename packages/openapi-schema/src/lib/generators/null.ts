import { LuftNull } from "@luftschloss/validation"
import { NullSchema } from "../types"

export const generateNullJsonSchema = (type: LuftNull): NullSchema => ({
  type: "null",
})
