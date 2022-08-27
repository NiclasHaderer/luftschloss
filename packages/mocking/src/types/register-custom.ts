import { LuftInfer, LuftType } from "@luftschloss/validation"
import { Constructor, Func } from "@luftschloss/common"

const MOCK_LOOKUP = new Map<Constructor<LuftType, unknown[]>, (type: LuftType) => any | never>()
const MOCK_GUARDS: [(validator: LuftType) => boolean, (type: LuftType) => any | never][] = []

export const registerMock = <T extends LuftType>(
  type: Constructor<T, any> | ((validator: LuftType) => boolean),
  mockFactory: (type: T) => LuftInfer<T>
) => {
  if (typeof type === "function") {
    MOCK_GUARDS.push([type as (validator: LuftType) => boolean, mockFactory as Func])
  } else {
    MOCK_LOOKUP.set(type, mockFactory as unknown as (type: LuftType) => any | never)
  }
}

export const getCustomMock = <T extends LuftType>(type: T): ((type: T) => LuftInfer<T>) | undefined => {
  const lookedUpMock = MOCK_LOOKUP.get(type.constructor as Constructor<LuftType, any>)
  if (lookedUpMock) return lookedUpMock
  return MOCK_GUARDS.find(([guard]) => guard(type))?.[1]
}
