import { LuftType } from "@luftschloss/validation";
import { Constructor, Func } from "@luftschloss/common";
import { GeneratedSchema } from "./type";

const SCHEMA_LOOKUP = new Map<
  Constructor<LuftType, unknown[]>,
  (type: LuftType, schemaPath: string) => GeneratedSchema
>();
const SCHEMA_GUARDS: [(validator: LuftType) => boolean, (type: LuftType, schemaPath: string) => GeneratedSchema][] = [];

export const registerJsonSchemaGenerator = <T extends LuftType>(
  type: Constructor<T, any> | ((validator: LuftType, schemaPath: string) => boolean),
  mockFactory: (type: T, schemaPath: string) => GeneratedSchema
) => {
  if (typeof type === "function") {
    SCHEMA_GUARDS.push([type as (validator: LuftType) => boolean, mockFactory as Func]);
  } else {
    SCHEMA_LOOKUP.set(type, mockFactory as unknown as (type: LuftType) => any | never);
  }
};

export const getCustomJsonSchemaGenerator = <T extends LuftType>(
  type: T
): ((type: T, schemaPath: string) => GeneratedSchema) | undefined => {
  const lookedUpMock = SCHEMA_LOOKUP.get(type.constructor as Constructor<LuftType, any>);
  if (lookedUpMock) return lookedUpMock;
  return SCHEMA_GUARDS.find(([guard]) => guard(type))?.[1];
};
