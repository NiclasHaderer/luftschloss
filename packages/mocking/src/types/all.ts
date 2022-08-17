import {
  getTypeOf,
  LuftAny,
  LuftArray,
  LuftBool,
  LuftDate,
  LuftInfer,
  LuftInt,
  LuftLiteral,
  LuftNever,
  LuftNull,
  LuftNumber,
  LuftObject,
  LuftRecord,
  LuftRegexp,
  LuftString,
  LuftTuple,
  LuftType,
  LuftUndefined,
  LuftUnion,
  LuftUUIDString,
} from "@luftschloss/validation"
import { fakeAny } from "./any"
import { fakeArray } from "./array"
import { fakeBool } from "./bool"
import { fakeDate } from "./date"
import { fakeInt } from "./int"
import { fakeLiteral } from "./literal"
import { fakeNever } from "./never"
import { fakeNull } from "./null"
import { fakeNumber } from "./number"
import { fakeObject } from "./object"
import { fakeRecord } from "./record"
import { fakeRegex } from "./regex"
import { fakeString } from "./string"
import { fakeTuple } from "./tuple"
import { fakeUndefined } from "./undefined"
import { fakeUnion } from "./union"
import { fakeUUID } from "./uuid"

export const fakeAll = <T extends LuftType>(validator: T): LuftInfer<T> => {
  // Null
  if (validator instanceof LuftNull) {
    return fakeNull(validator) as LuftInfer<T>
  }
  // Undefined
  else if (validator instanceof LuftUndefined) {
    return fakeUndefined(validator) as LuftInfer<T>
  }
  // Int
  else if (validator instanceof LuftInt) {
    return fakeInt(validator) as LuftInfer<T>
  }
  // Number
  else if (validator instanceof LuftNumber) {
    return fakeNumber(validator) as LuftInfer<T>
  }
  // UUID
  else if (validator instanceof LuftUUIDString) {
    return fakeUUID(validator) as LuftInfer<T>
  }
  // Regex
  else if (validator instanceof LuftRegexp) {
    return fakeRegex(validator) as LuftInfer<T>
  }
  // String
  else if (validator instanceof LuftString) {
    return fakeString(validator) as LuftInfer<T>
  }
  // Union
  else if (validator instanceof LuftUnion) {
    return fakeUnion(validator) as LuftInfer<T>
  }
  // Tuple
  else if (validator instanceof LuftTuple) {
    return fakeTuple(validator) as LuftInfer<T>
  }
  // Never
  else if (validator instanceof LuftNever) {
    return fakeNever(validator) as LuftInfer<T>
  }
  // Literal
  else if (validator instanceof LuftLiteral) {
    return fakeLiteral(validator) as LuftInfer<T>
  }
  // Date
  else if (validator instanceof LuftDate) {
    return fakeDate(validator) as LuftInfer<T>
  }
  // Array
  else if (validator instanceof LuftArray) {
    return fakeArray(validator) as LuftInfer<T>
  }
  // Bool
  else if (validator instanceof LuftBool) {
    return fakeBool(validator) as LuftInfer<T>
  }
  // Record
  else if (validator instanceof LuftRecord) {
    return fakeRecord(validator) as LuftInfer<T>
  }
  // Object
  else if (validator instanceof LuftObject) {
    return fakeObject(validator) as LuftInfer<T>
  }
  // Any
  else if (validator instanceof LuftAny) {
    return fakeAny(validator) as LuftInfer<T>
  }

  throw new Error(`Could not find a faker for ${getTypeOf(validator)}`)
}
