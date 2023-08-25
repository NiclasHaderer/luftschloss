import { LuftNull } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { LuftInterface } from "./all";

export const generateInterfaceForNull = (type: LuftNull): LuftInterface =>
  interfaceWithName(type, {
    schema: "null",
  });
