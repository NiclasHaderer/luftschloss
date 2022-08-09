import {
  LuftAny,
  LuftArray,
  LuftBaseType,
  LuftDate,
  LuftInt,
  LuftLiteral,
  LuftNever,
  LuftNumber,
  LuftObject,
  LuftRecord,
  LuftRecordKey,
  LuftRegexp,
  LuftString,
  LuftTuple,
  LuftUUIDString,
} from "./types"

export const any = () => new LuftAny()
export const array = <T extends LuftBaseType<unknown>>(type: T) => new LuftArray({ type })
export const date = () => new LuftDate()

export const int = () => new LuftInt()
export const literal = <T extends string | number | boolean>(types: T[]) => new LuftLiteral({ types })
export const never = () => new LuftNever()
export const number = () => new LuftNumber()
export const object = <T extends Record<string, LuftBaseType<unknown>>>(type: T) => new LuftObject({ type })
export const record = <KEY extends LuftRecordKey, VALUE extends LuftBaseType<unknown>>(key: KEY, value: VALUE) =>
  new LuftRecord({
    key,
    value,
  })
export const regex = (regex: RegExp) => new LuftRegexp({ regex })
export const string = () => new LuftString()
export const tuple = <T extends LuftBaseType<unknown>>(types: T[]) => new LuftTuple({ types })
export const uuid = () => new LuftUUIDString()

export const luft = {
  any,
  array,
  date,
  int,
  literal,
  never,
  number,
  object,
  record,
  regex,
  string,
  tuple,
  uuid,
}
