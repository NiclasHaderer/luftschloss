import { LuftRegex } from "@luftschloss/validation";
import { StringSchema } from "../types";
import { GeneratedSchema, toGeneratedSchema } from "./type";

export const generateRegexJsonSchema = (type: LuftRegex, schemaPath: string): GeneratedSchema => {
  const regexSchema: StringSchema = {
    type: "string",
    pattern: type.schema.regex.source,
  };
  if (type.schema.minLength) {
    regexSchema.minLength = type.schema.minLength;
  }

  if (type.schema.maxLength) {
    regexSchema.maxLength = type.schema.maxLength;
  }

  return toGeneratedSchema(type, regexSchema, schemaPath, {});
};
