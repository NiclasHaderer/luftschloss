import { LuftObject } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { GenerateSubType, LuftInterface } from "./all";

export const generateInterfaceForObject = (type: LuftObject<any>, generateSubType: GenerateSubType): LuftInterface =>
  interfaceWithName(type, {
    schema: `{ ${Object.entries(type.schema)
      .map(([key, value]) => `${key}: ${value.reference()}`)
      .join(", ")} }`,
  });
