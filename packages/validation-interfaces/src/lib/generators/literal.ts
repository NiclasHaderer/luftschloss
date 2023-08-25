import { LuftLiteral } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { LuftInterface } from "./all";

export const generateInterfaceForLiteral = (type: LuftLiteral<any>): LuftInterface =>
  interfaceWithName(type, {
    schema: JSON.stringify(type.schema.types.map((t: string | number | boolean) => t.toString()).join(" | ")),
  });
