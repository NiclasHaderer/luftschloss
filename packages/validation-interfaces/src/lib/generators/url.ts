import { LuftURL } from "@luftschloss/validation";
import { interfaceWithName } from "../interface-with-name";
import { LuftInterface } from "./all";

export const generateInterfaceForURL = (type: LuftURL): LuftInterface =>
  interfaceWithName(type, {
    schema: "URL",
  });
