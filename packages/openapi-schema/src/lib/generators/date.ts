import { LuftDate } from "@luftschloss/validation";
import { GeneratedSchema, toGeneratedSchema } from "./type";

export const generateDateJsonSchema = (type: LuftDate, schemaPath: string): GeneratedSchema =>
  toGeneratedSchema(
    type,
    {
      type: "string",
      format: "date-time",
    },
    schemaPath,
    {}
  );
