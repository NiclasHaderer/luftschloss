import { LuftType, LuftUnion } from "@luftschloss/validation"
import { CommonSchema } from "../types"
import { generateJsonSchema } from "./all"

export const generateUnionJsonSchema = (type: LuftUnion<LuftType[]>): CommonSchema => ({
  oneOf: type.schema.types.map(generateJsonSchema),
})
