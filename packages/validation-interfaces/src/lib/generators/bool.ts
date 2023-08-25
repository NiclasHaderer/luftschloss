import { LuftBool } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { LuftInterface } from "./all";

export const generateInterfaceForBool = (type: LuftBool): LuftInterface =>
  interfaceWithName(type, {
    schema: "boolean",
  });
