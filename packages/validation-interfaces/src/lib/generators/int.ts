import { LuftInt } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { LuftInterface } from "./all";

export const generateInterfaceForInt = (type: LuftInt): LuftInterface =>
  interfaceWithName(type, {
    schema: "int",
  });
