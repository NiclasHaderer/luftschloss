import { LuftType } from "@luftschloss/validation"
import { Constructor, Func } from "@luftschloss/common"
import { AllSchemas } from "../types"

const SCHEMA_LOOKUP = new Map<Constructor<LuftType, unknown[]>, (type: LuftType) => AllSchemas>()
const SCHEMA_GUARDS: [(validator: LuftType) => boolean, (type: LuftType) => AllSchemas][] = []

export const registerJsonSchemaGenerator = <T extends LuftType>(
  type: Constructor<T, any> | ((validator: LuftType) => boolean),
  mockFactory: (type: T) => AllSchemas
) => {
  if (typeof type === "function") {
    SCHEMA_GUARDS.push([type as (validator: LuftType) => boolean, mockFactory as Func])
  } else {
    SCHEMA_LOOKUP.set(type, mockFactory as unknown as (type: LuftType) => any | never)
  }
}

export const getCustomJsonSchemaGenerator = <T extends LuftType>(type: T): ((type: T) => AllSchemas) | undefined => {
  const lookedUpMock = SCHEMA_LOOKUP.get(type.constructor as Constructor<LuftType, any>)
  if (lookedUpMock) return lookedUpMock
  return SCHEMA_GUARDS.find(([guard]) => guard(type))?.[1]
}
