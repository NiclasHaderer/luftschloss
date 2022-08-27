import {
  LuftInt,
  LuftNumber,
  LuftRecord,
  LuftRecordKey,
  LuftRegex,
  LuftString,
  LuftType,
} from "@luftschloss/validation"
import { CommonSchema, ObjectSchema, StringSchema } from "../types"
import { generateRegexJsonSchema } from "./regex"
import { generateStringJsonSchema } from "./string"
import { generateJsonSchema } from "./all"

const getNameSchema = (key: LuftRecordKey): StringSchema | CommonSchema => {
  if (key instanceof LuftRegex) {
    return generateRegexJsonSchema(key)
  } else if (key instanceof LuftInt) {
    return { type: "string", pattern: "^[+-]?[0-9]+$" }
  } else if (key instanceof LuftNumber) {
    return { type: "string", pattern: "^[+-]?(?:[0-9]*[.])?[0-9]+$" }
  } else if (key instanceof LuftString) {
    return generateStringJsonSchema(key)
  } else {
    return {
      anyOf: key.schema.types.map(getNameSchema),
    }
  }
}

export const generateRecordJsonSchema = (type: LuftRecord<LuftRecordKey, LuftType>): ObjectSchema => {
  const objectSchema: ObjectSchema = {
    type: "object",
    additionalProperties: generateJsonSchema(type.schema.value),
    propertyNames: getNameSchema(type.schema.key),
  }

  if (type.schema.maxProperties !== undefined) {
    objectSchema.maxProperties = type.schema.maxProperties
  }

  if (type.schema.minProperties !== undefined) {
    objectSchema.minProperties = type.schema.minProperties
  }

  return objectSchema
}
