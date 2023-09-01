import { LuftLazy } from "@luftschloss/validation";
import { generateJsonSchema } from "./all";

export const generateLazyJsonSchema = (type: LuftLazy, schemaPath: string) =>
  generateJsonSchema(type.schema.typeFactory(), schemaPath);
