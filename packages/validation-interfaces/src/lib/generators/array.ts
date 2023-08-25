import { LuftArray } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { GenerateSubType, LuftInterface } from "./all";

export const generateInterfaceForArray = (type: LuftArray<any>, generateSubType: GenerateSubType): LuftInterface =>
  interfaceWithName(type, {
    schema: `(${generateSubType(type.schema.type).reference()})[]`,
  });
