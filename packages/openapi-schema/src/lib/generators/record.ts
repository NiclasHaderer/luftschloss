import {
  LuftInt,
  LuftNumber,
  LuftRecord,
  LuftRecordKey,
  LuftRegex,
  LuftString,
  LuftType,
} from "@luftschloss/validation";
import { CommonSchema, ObjectSchema } from "../types";
import { generateRegexJsonSchema } from "./regex";
import { generateStringJsonSchema } from "./string";
import { GeneratedSchema, toGeneratedSchema } from "./type";
import { generateUnionJsonSchema } from "./union";
import { generateJsonSchema } from "./all";

const getNameSchema = (key: LuftRecordKey, schemaPath: string): GeneratedSchema => {
  if (key instanceof LuftRegex) {
    return generateRegexJsonSchema(key, schemaPath);
  } else if (key instanceof LuftInt) {
    return toGeneratedSchema(key, { type: "string", pattern: "^[+-]?[0-9]+$" }, schemaPath, {});
  } else if (key instanceof LuftNumber) {
    return toGeneratedSchema(key, { type: "string", pattern: "^[+-]?(?:[0-9]*[.])?[0-9]+$" }, schemaPath, {});
  } else if (key instanceof LuftString) {
    return generateStringJsonSchema(key, schemaPath);
  } else {
    return generateUnionJsonSchema(key, schemaPath);
  }
};

export const generateRecordJsonSchema = (
  type: LuftRecord<LuftRecordKey, LuftType>,
  schemaPath: string
): GeneratedSchema => {
  const valueSchemas = generateJsonSchema(type.schema.value, schemaPath);
  const keySchemas = getNameSchema(type.schema.key, schemaPath);

  const objectSchema: ObjectSchema = {
    type: "object",
    additionalProperties: valueSchemas.root,
    propertyNames: keySchemas.root as CommonSchema,
  };

  if (type.schema.maxProperties !== undefined) {
    objectSchema.maxProperties = type.schema.maxProperties;
  }

  if (type.schema.minProperties !== undefined) {
    objectSchema.minProperties = type.schema.minProperties;
  }

  return toGeneratedSchema(type, objectSchema, schemaPath, {
    ...valueSchemas.named,
    ...keySchemas.named,
  });
};
