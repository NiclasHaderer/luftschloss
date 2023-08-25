import { LuftRecord } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { GenerateSubType, LuftInterface } from "./all";

export const generateInterfaceForRecord = (
  type: LuftRecord<any, any>,
  generateSubType: GenerateSubType
): LuftInterface =>
  interfaceWithName(type, {
    schema: `{ [key: ${generateSubType(type.schema.key).reference()}]: ${generateSubType(
      type.schema.value
    ).reference()} }`,
  });
