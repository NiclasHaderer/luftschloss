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

export const luft = {
  any: () => new LuftAny(),
  array: <T extends LuftBaseType<unknown>>(type: T) => new LuftArray({ type }),
  date: () => new LuftDate(),
  int: () => new LuftInt(),
  literal: <T extends string | number | boolean>(...types: T[]) => new LuftLiteral({ types }),
  never: () => new LuftNever(),
  number: () => new LuftNumber(),
  object: <T extends Record<string, LuftBaseType<unknown>>>(type: T) => new LuftObject({ type }),
  record: <KEY extends LuftRecordKey, VALUE extends LuftBaseType<unknown>>(key: KEY, value: VALUE) =>
    new LuftRecord({
      key,
      value,
    }),
  regex: (regex: RegExp) => new LuftRegexp({ regex }),
  string: () => new LuftString(),
  tuple: <T extends LuftBaseType<unknown>>(...types: T[]) => new LuftTuple({ types }),
  uuid: () => new LuftUUIDString(),
}
