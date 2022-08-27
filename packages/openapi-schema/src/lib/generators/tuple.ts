import { LuftTuple, LuftType } from "@luftschloss/validation"
import { ArraySchema } from "../types"
import { generateJsonSchema } from "./all"

export const generateTupleJsonSchema = (type: LuftTuple<LuftType[]>): ArraySchema => ({
  type: "array",
  prefixItems: type.schema.types.map(generateJsonSchema),
})
