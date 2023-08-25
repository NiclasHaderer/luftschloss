import { LuftNever, LuftType } from "@luftschloss/validation";
import { LuftInterface } from "./generators/all";

export const interfaceWithName = (
  type: LuftType | LuftNever,
  { schema, fallbackName }: { schema: string; fallbackName?: string }
): LuftInterface => {
  const name = type.validationStorage.name ?? fallbackName;
  if (name) {
    return {
      named: true,
      name,
      inlined: false,
      schema,
      reference: () => name,
    };
  } else {
    return {
      named: false,
      inlined: true,
      schema,
      reference: () => schema,
    };
  }
};
