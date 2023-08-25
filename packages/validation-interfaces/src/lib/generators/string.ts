import { LuftString } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { LuftInterface } from "./all";

export const generateInterfaceForString = (type: LuftString): LuftInterface =>
  interfaceWithName(type, {
    schema: "string",
  });
