import {
  LuftAny,
  LuftArray,
  LuftBool,
  LuftDate,
  LuftInt,
  LuftLazy,
  LuftLiteral,
  LuftNever,
  LuftNull,
  LuftNumber,
  LuftObject,
  LuftRecord,
  LuftRecordKey,
  LuftRegex,
  LuftString,
  LuftTuple,
  LuftType,
  LuftUndefined,
  LuftUnion,
  LuftURL,
  LuftUUIDString,
} from "./types";

export const any = () => new LuftAny();
export const array = <T extends LuftType>(type: T) => new LuftArray({ type });
export const bool = () => new LuftBool();
export const date = () => new LuftDate();
export const url = () => new LuftURL();
export const int = () => new LuftInt();
export const lazy = <T>(factory: () => LuftType<T>) => new LuftLazy<T>(factory);
export const literal = <T extends string | number | boolean>(types: ReadonlyArray<T>) => new LuftLiteral({ types });
export const never = () => new LuftNever();
export const nullFactory = () => new LuftNull();
export const number = () => new LuftNumber();
export const object = <T extends Record<string, LuftType>>(type: T) => new LuftObject({ type });
export const record = <KEY extends LuftRecordKey, VALUE extends LuftType>(key: KEY, value: VALUE) =>
  new LuftRecord({
    key,
    value,
  });
export const regex = (regex: RegExp) => new LuftRegex({ regex });
export const string = () => new LuftString();
export const tuple = <T extends LuftType>(types: ReadonlyArray<T>) => new LuftTuple({ types });
export const undefinedFactory = () => new LuftUndefined();
export const union = <T extends LuftType>(types: ReadonlyArray<T>) => new LuftUnion({ types });
export const uuid = () => new LuftUUIDString();

export const luft = {
  any,
  array,
  bool,
  date,
  lazy,
  int,
  literal,
  never,
  null: nullFactory,
  number,
  object,
  record,
  regex,
  string,
  tuple,
  url,
  undefined: undefinedFactory,
  union: union,
  uuid: uuid,
};
