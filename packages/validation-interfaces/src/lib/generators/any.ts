import { LuftAny } from "@luftschloss/validation";
import { LuftInterface } from "./all";
import { interfaceWithName } from "../interface-with-name";

export const generateInterfaceForAny = (type: LuftAny): LuftInterface =>
  interfaceWithName(type, {
    schema: "any",
  });
