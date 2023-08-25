import { LuftUUIDString } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { LuftInterface } from "./all";

export const generateInterfaceForUUIDString = (type: LuftUUIDString): LuftInterface =>
  interfaceWithName(type, {
    fallbackName: "uuid",
    schema: "`${string}-${string}-${string}-${string}-${string}`",
  });
