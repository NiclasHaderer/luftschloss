import { LuftAny } from "@luftschloss/validation"
import { StringSchema } from "../types"

export const generateDateJsonSchema = (type: LuftAny): StringSchema => ({
  type: "string",
  format: "date-time",
})
