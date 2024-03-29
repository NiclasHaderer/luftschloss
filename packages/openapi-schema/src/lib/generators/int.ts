import { LuftInt } from "@luftschloss/validation";
import { NumberSchema } from "../types";
import { GeneratedSchema, toGeneratedSchema } from "./type";

export const generateIntJsonSchema = (type: LuftInt, schemaPath: string): GeneratedSchema => {
  const intSchema: NumberSchema = {
    type: "integer",
  };
  if (type.schema.min !== undefined) {
    if (type.schema.minCompare === ">=") {
      intSchema.minimum = type.schema.min;
    } else {
      intSchema.exclusiveMinimum = type.schema.min;
    }
  }

  if (type.schema.max !== undefined) {
    if (type.schema.maxCompare === "<=") {
      intSchema.maximum = type.schema.max;
    } else {
      intSchema.exclusiveMaximum = type.schema.max;
    }
  }

  if (type.schema.multipleOf !== undefined) {
    intSchema.multipleOf = type.schema.multipleOf;
  }

  return toGeneratedSchema(type, intSchema, schemaPath, {});
};
