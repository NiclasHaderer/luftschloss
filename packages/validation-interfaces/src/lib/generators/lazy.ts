import { GenerateSubType, LuftInterface } from "./all";
import { LuftLazy } from "@luftschloss/validation";

export const generateInterfaceForLazy = (type: LuftLazy<any>, generateSubType: GenerateSubType): LuftInterface =>
  generateSubType(type.schema.typeFactory());
