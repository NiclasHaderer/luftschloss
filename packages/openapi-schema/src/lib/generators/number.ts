import { LuftNumber } from "@luftschloss/validation";
import { NumberSchema } from "../types";
import { GeneratedSchema, toGeneratedSchema } from "./type";

export const generateNumberJsonSchema = (type: LuftNumber, schemaPath: string): GeneratedSchema => {
  const numberSchema: NumberSchema = {
    type: "number",
  };

  if (type.schema.min !== undefined) {
    if (type.schema.minCompare === ">=") {
      numberSchema.minimum = type.schema.min;
    } else {
      numberSchema.exclusiveMinimum = type.schema.min;
    }
  }

  if (type.schema.max !== undefined) {
    if (type.schema.maxCompare === "<=") {
      numberSchema.maximum = type.schema.max;
    } else {
      numberSchema.exclusiveMaximum = type.schema.max;
    }
  }

  if (type.schema.multipleOf !== undefined) {
    numberSchema.multipleOf = type.schema.multipleOf;
  }

  return toGeneratedSchema(type, numberSchema, schemaPath, {});
};
