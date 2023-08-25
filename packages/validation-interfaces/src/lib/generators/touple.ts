import { LuftTuple } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { GenerateSubType, LuftInterface } from "./all";

export const generateInterfaceForTuple = (type: LuftTuple<any>, generateSubType: GenerateSubType): LuftInterface =>
  interfaceWithName(type, {
    schema: `[${type.schema.types.flatMap(generateSubType).join(", ")}]`,
  });
