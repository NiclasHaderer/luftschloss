import { LuftNever } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { LuftInterface } from "./all";

export const generateInterfaceForNever = (type: LuftNever): LuftInterface =>
  interfaceWithName(type, { schema: "never" });
