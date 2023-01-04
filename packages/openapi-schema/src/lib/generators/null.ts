import { LuftNull } from "@luftschloss/validation";
import { GeneratedSchema, toGeneratedSchema } from "./type";

export const generateNullJsonSchema = (type: LuftNull, schemaPath: string): GeneratedSchema =>
  toGeneratedSchema(type, { type: "null" }, schemaPath, {});
