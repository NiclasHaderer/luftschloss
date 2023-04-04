import {
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
  LuftURL,
  LuftUUIDString,
} from "@luftschloss/validation";
import { generateNullJsonSchema } from "./null";
import { generateUndefinedJsonSchema } from "./undefined";
import { generateIntJsonSchema } from "./int";
import { generateNumberJsonSchema } from "./number";
import { generateRegexJsonSchema } from "./regex";
import { generateStringJsonSchema } from "./string";
import { generateUnionJsonSchema } from "./union";
import { generateTupleJsonSchema } from "./tuple";
import { generateNeverJsonSchema } from "./never";
import { generateLiteralJsonSchema } from "./literal";
import { generateDateJsonSchema } from "./date";
import { generateAnyJsonSchema } from "./any";
import { generateArrayJsonSchema } from "./array";
import { generateBoolJsonSchema } from "./bool";
import { generateRecordJsonSchema } from "./record";
import { generateObjectJsonSchema } from "./object";
import { getCustomJsonSchemaGenerator } from "./register-custom";
import { GeneratedSchema } from "./type";
import { getTypeOf } from "@luftschloss/common";
import { generateURLJsonSchema } from "./url";

export const generateJsonSchema = (validator: LuftType, schemaPath: string): GeneratedSchema => {
  // Null
  if (validator.constructor === LuftNull) {
    return generateNullJsonSchema(validator, schemaPath);
  }
  // Undefined
  if (validator.constructor === LuftUndefined) {
    return generateUndefinedJsonSchema(validator, schemaPath);
  }
  // Int
  if (validator.constructor === LuftInt) {
    return generateIntJsonSchema(validator, schemaPath);
  }
  // Number
  if (validator.constructor === LuftNumber) {
    return generateNumberJsonSchema(validator, schemaPath);
  }
  // UUID
  if (validator.constructor === LuftUUIDString) {
    return generateRegexJsonSchema(validator, schemaPath);
  }
  // String
  if (validator.constructor === LuftString) {
    return generateStringJsonSchema(validator, schemaPath);
  }
  // Union
  if (validator.constructor === LuftUnion) {
    return generateUnionJsonSchema(validator, schemaPath);
  }
  // Tuple
  if (validator.constructor === LuftTuple) {
    return generateTupleJsonSchema(validator, schemaPath);
  }
  // Never
  if (validator.constructor === LuftNever) {
    return generateNeverJsonSchema(validator, schemaPath);
  }
  // Literal
  if (validator.constructor === LuftLiteral) {
    return generateLiteralJsonSchema(validator, schemaPath);
  }
  // Date
  if (validator.constructor === LuftDate) {
    return generateDateJsonSchema(validator, schemaPath);
  }
  // Array
  if (validator.constructor === LuftArray) {
    return generateArrayJsonSchema(validator, schemaPath);
  }
  // Bool
  if (validator.constructor === LuftBool) {
    return generateBoolJsonSchema(validator, schemaPath);
  }
  // Record
  if (validator.constructor === LuftRecord) {
    return generateRecordJsonSchema(validator, schemaPath);
  }
  // Object
  if (validator.constructor === LuftObject) {
    return generateObjectJsonSchema(validator, schemaPath);
  }
  // URL
  if (validator.constructor === LuftURL) {
    return generateURLJsonSchema(validator, schemaPath);
  }
  // Any
  if (validator.constructor === LuftAny) {
    return generateAnyJsonSchema(validator, schemaPath);
  }

  const customMock = getCustomJsonSchemaGenerator(validator);
  if (customMock) {
    return customMock(validator, schemaPath);
  }

  throw new Error(
    `Could not find schema generator for ${getTypeOf(
      validator
    )} . Add one yourself with \`registerJsonSchemaGenerator\``
  );
};
