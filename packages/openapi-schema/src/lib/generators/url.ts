import { LuftURL } from "@luftschloss/validation";
import { StringSchema } from "../types";
import { GeneratedSchema, toGeneratedSchema } from "./type";

export const generateURLJsonSchema = (type: LuftURL, schemaPath: string): GeneratedSchema => {
  const stringSchema: StringSchema = {
    type: "string",
    format: "uri",
  };

  return toGeneratedSchema(type, stringSchema, schemaPath, {});
};
