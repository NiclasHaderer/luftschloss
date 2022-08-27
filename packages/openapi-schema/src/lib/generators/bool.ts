import { LuftBool } from "@luftschloss/validation"
import { BooleanSchema } from "../types"

export const generateBoolJsonSchema = (type: LuftBool): BooleanSchema => ({ type: "boolean" })
