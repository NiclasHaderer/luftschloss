import { LuftInfer, LuftType } from "@luftschloss/validation"
import { Constructor } from "@luftschloss/common"

const GLOBAL_MOCKS = new Map<Constructor<LuftType, any>, (type: LuftType) => any | never>()

export const registerMock = <T extends Constructor<LuftType, any>>(
  type: T,
  mockFactory: (type: T) => T extends LuftInfer<infer H> ? LuftInfer<H> : never
) => {
  GLOBAL_MOCKS.set(type, mockFactory as unknown as (type: LuftType) => any | never)
}

export const getCustomMock = <T extends LuftType>(type: T): ((type: T) => LuftInfer<T>) | undefined =>
  GLOBAL_MOCKS.get(type.constructor as Constructor<LuftType, any>)
