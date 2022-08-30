import {
  getTypeOf,
  LuftAny,
  LuftArray,
  LuftBool,
  LuftDate,
  LuftInt,
  LuftLiteral,
  LuftNever,
  LuftNull,
  LuftNumber,
  LuftObject,
  LuftRecord,
  LuftString,
  LuftTuple,
  LuftType,
  LuftUndefined,
  LuftUnion,
  LuftUUIDString,
} from "@luftschloss/validation"
import { AllSchemas } from "../types"
import { generateNullJsonSchema } from "./null"
import { generateUndefinedJsonSchema } from "./undefined"
import { generateIntJsonSchema } from "./int"
import { generateNumberJsonSchema } from "./number"
import { generateRegexJsonSchema } from "./regex"
import { generateStringJsonSchema } from "./string"
import { generateUnionJsonSchema } from "./union"
import { generateTupleJsonSchema } from "./tuple"
import { generateNeverJsonSchema } from "./never"
import { generateLiteralJsonSchema } from "./literal"
import { generateDateJsonSchema } from "./date"
import { generateAnyJsonSchema } from "./any"
import { generateArrayJsonSchema } from "./array"
import { generateBoolJsonSchema } from "./bool"
import { generateRecordJsonSchema } from "./record"
import { generateObjectJsonSchema } from "./object"
import { getCustomJsonSchemaGenerator } from "./register-custom"

export const generateJsonSchema = (validator: LuftType): AllSchemas => {
  // Null
  if (validator.constructor === LuftNull) {
    return generateNullJsonSchema(validator)
  }
  // Undefined
  if (validator.constructor === LuftUndefined) {
    return generateUndefinedJsonSchema(validator)
  }
  // Int
  if (validator.constructor === LuftInt) {
    return generateIntJsonSchema(validator)
  }
  // Number
  if (validator.constructor === LuftNumber) {
    return generateNumberJsonSchema(validator)
  }
  // UUID
  if (validator.constructor === LuftUUIDString) {
    return generateRegexJsonSchema(validator)
  }
  // String
  if (validator.constructor === LuftString) {
    return generateStringJsonSchema(validator)
  }
  // Union
  if (validator.constructor === LuftUnion) {
    return generateUnionJsonSchema(validator)
  }
  // Tuple
  if (validator.constructor === LuftTuple) {
    return generateTupleJsonSchema(validator)
  }
  // Never
  if (validator.constructor === LuftNever) {
    return generateNeverJsonSchema(validator)
  }
  // Literal
  if (validator.constructor === LuftLiteral) {
    return generateLiteralJsonSchema(validator)
  }
  // Date
  if (validator.constructor === LuftDate) {
    return generateDateJsonSchema(validator)
  }
  // Array
  if (validator.constructor === LuftArray) {
    return generateArrayJsonSchema(validator)
  }
  // Bool
  if (validator.constructor === LuftBool) {
    return generateBoolJsonSchema(validator)
  }
  // Record
  if (validator.constructor === LuftRecord) {
    return generateRecordJsonSchema(validator)
  }
  // Object
  if (validator.constructor === LuftObject) {
    return generateObjectJsonSchema(validator)
  }
  // Any
  if (validator.constructor === LuftAny) {
    return generateAnyJsonSchema(validator)
  }

  const customMock = getCustomJsonSchemaGenerator(validator)
  if (customMock) {
    return customMock(validator)
  }

  throw new Error(
    `Could not find schema generator for ${getTypeOf(
      validator
    )} . Add one yourself with \`registerJsonSchemaGenerator\``
  )
}
