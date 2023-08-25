import { Constructor, Func } from "@luftschloss/common";
import { LuftType } from "@luftschloss/validation";
import { GenerateSubType, LuftInterface } from "./generators/all";

const SCHEMA_LOOKUP = new Map<
  Constructor<LuftType, unknown[]>,
  (type: LuftType, generateSubType: GenerateSubType) => LuftInterface
>();
const SCHEMA_GUARDS: [(validator: LuftType) => boolean, (type: LuftType) => LuftInterface][] = [];

export const registerInterfaceGenerator = <T extends LuftType>(
  type: Constructor<T, any> | ((validator: LuftType) => boolean),
  interfaceFactory: (type: T, generateSubType: GenerateSubType) => LuftInterface
) => {
  if (typeof type === "function") {
    SCHEMA_GUARDS.push([type as (validator: LuftType) => boolean, interfaceFactory as Func]);
  } else {
    SCHEMA_LOOKUP.set(type, interfaceFactory as unknown as (type: LuftType) => any | never);
  }
};

export const getCustomInterfaceGenerator = <T extends LuftType>(
  type: T
): ((type: T, generateSubType: GenerateSubType) => LuftInterface) | undefined => {
  const lookedUpMock = SCHEMA_LOOKUP.get(type.constructor as Constructor<LuftType, any>);
  if (lookedUpMock) return lookedUpMock;
  return SCHEMA_GUARDS.find(([guard]) => guard(type))?.[1];
};
