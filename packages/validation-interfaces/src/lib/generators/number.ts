import { LuftNumber } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { LuftInterface } from "./all";

export const generateInterfaceForNumber = (type: LuftNumber): LuftInterface =>
  interfaceWithName(type, {
    schema: "number",
  });
