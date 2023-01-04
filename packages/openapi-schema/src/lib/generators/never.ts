import { LuftNever } from "@luftschloss/validation";
import { GeneratedSchema, toGeneratedSchema } from "./type";

export const generateNeverJsonSchema = (type: LuftNever, schemaPath: string): GeneratedSchema =>
  toGeneratedSchema(type, false, schemaPath, {});
