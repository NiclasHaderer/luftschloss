import { LuftUnion } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { GenerateSubType } from "./all";

export const generateInterfaceForUnion = (type: LuftUnion<any>, generateSubType: GenerateSubType) =>
  interfaceWithName(type, {
    schema: type.schema.types.flatMap(generateSubType).join(" | "),
  });
