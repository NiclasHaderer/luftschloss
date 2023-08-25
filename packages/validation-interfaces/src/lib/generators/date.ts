import { LuftDate } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { LuftInterface } from "./all";

export const generateInterfaceForDate = (type: LuftDate): LuftInterface =>
  interfaceWithName(type, {
    schema: "Date",
  });
