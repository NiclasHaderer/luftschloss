import { LuftUndefined } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { LuftInterface } from "./all";

export const generateInterfaceForUndefined = (type: LuftUndefined): LuftInterface =>
  interfaceWithName(type, {
    schema: "undefined",
  });
