import { LuftObject, LuftType } from "@luftschloss/validation";
import { AllSchemas, ObjectSchema } from "../types";
import { saveObject } from "@luftschloss/common";
import { GeneratedSchema, toGeneratedSchema } from "./type";
import { generateJsonSchema } from "./all";

export const generateObjectJsonSchema = (type: LuftObject<any>, schemaPath: string): GeneratedSchema => {
  const objectSchema: ObjectSchema = {
    type: "object",
  };

  objectSchema.additionalProperties = type.schema.ignoreUnknownKeys;

  objectSchema.required = [];
  objectSchema.properties = saveObject<{ [key: string]: AllSchemas }>();
  let namedSubSchemas: { [key: string]: AllSchemas } = {};
  for (const [name, childType] of Object.entries(type.schema.type as Record<string, LuftType>)) {
    objectSchema.required.push(name);
    const valueSchema = generateJsonSchema(childType, schemaPath);
    namedSubSchemas = { ...namedSubSchemas, ...valueSchema.named };
    objectSchema.properties[name] = valueSchema.root;
  }

  return toGeneratedSchema(type, objectSchema, schemaPath, namedSubSchemas);
};
