import { AllSchemas } from "../types";
import { LuftNever, LuftType } from "@luftschloss/validation";

export interface GeneratedSchema {
  named: {
    [key: string]: AllSchemas;
  };
  root: AllSchemas;
}

export const toGeneratedSchema = (
  type: LuftType | LuftNever,
  schema: AllSchemas,
  schemaPath: string,
  subSchemas: { [name: string]: AllSchemas }
): GeneratedSchema => {
  if (type.validationStorage.name) {
    return {
      named: {
        [type.validationStorage.name]: schema,
        ...subSchemas,
      },
      root: { $ref: `${schemaPath}/${type.validationStorage.name}`.replaceAll("//", "/") },
    };
  }

  return {
    named: subSchemas,
    root: schema,
  };
};

export const mergeGeneratedSchemas = (generatedSchemas: GeneratedSchema[]) => {
  const root = generatedSchemas.map(subSchema => subSchema.root);
  const namedSubSchemas = generatedSchemas.reduce((previousValue, currentValue) => {
    return {
      ...previousValue,
      ...currentValue.named,
    };
  }, {} as { [key: string]: AllSchemas });

  return {
    named: namedSubSchemas,
    root,
  };
};
