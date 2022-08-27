import { LuftObject, LuftType } from "@luftschloss/validation"
import { AllSchemas, ObjectSchema } from "../types"
import { generateJsonSchema } from "./all"
import { saveObject } from "@luftschloss/common"

export const generateObjectJsonSchema = (type: LuftObject<any>): ObjectSchema => {
  const objectSchema: ObjectSchema = {
    type: "object",
  }

  objectSchema.additionalProperties = type.schema.ignoreUnknownKeys

  objectSchema.required = []
  objectSchema.properties = saveObject<{ [key: string]: AllSchemas }>()
  for (const [name, childType] of Object.entries(type.schema.type as Record<string, LuftType>)) {
    objectSchema.required.push(name)
    objectSchema.properties[name] = generateJsonSchema(childType)
  }

  return objectSchema
}
