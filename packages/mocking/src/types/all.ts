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
import { fakeString } from "./string"
import { fakeTuple } from "./tuple"
import { fakeUndefined } from "./undefined"
import { fakeUnion } from "./union"
import { fakeUUID } from "./uuid"

// TODO add custom mocks

export const fakeAll = <T extends LuftType>(validator: T): LuftInfer<T> => {
  // Null
  if (validator.constructor === LuftNull) {
    return fakeNull(validator) as LuftInfer<T>
  }
  // Undefined
  else if (validator.constructor === LuftUndefined) {
    return fakeUndefined(validator) as LuftInfer<T>
  }
  // Int
  else if (validator.constructor === LuftInt) {
    return fakeInt(validator) as LuftInfer<T>
  }
  // Number
  else if (validator.constructor === LuftNumber) {
    return fakeNumber(validator) as LuftInfer<T>
  }
  // UUID
  else if (validator.constructor === LuftUUIDString) {
    return fakeUUID(validator) as LuftInfer<T>
  }
  // String
  else if (validator.constructor === LuftString) {
    return fakeString(validator) as LuftInfer<T>
  }
  // Union
  else if (validator.constructor === LuftUnion) {
    return fakeUnion(validator) as LuftInfer<T>
  }
  // Tuple
  else if (validator.constructor === LuftTuple) {
    return fakeTuple(validator) as LuftInfer<T>
  }
  // Never
  else if (validator.constructor === LuftNever) {
    return fakeNever(validator) as LuftInfer<T>
  }
  // Literal
  else if (validator.constructor === LuftLiteral) {
    return fakeLiteral(validator) as LuftInfer<T>
  }
  // Date
  else if (validator.constructor === LuftDate) {
    return fakeDate(validator) as LuftInfer<T>
  }
  // Array
  else if (validator.constructor === LuftArray) {
    return fakeArray(validator) as LuftInfer<T>
  }
  // Bool
  else if (validator.constructor === LuftBool) {
    return fakeBool(validator) as LuftInfer<T>
  }
  // Record
  else if (validator.constructor === LuftRecord) {
    return fakeRecord(validator) as LuftInfer<T>
  }
  // Object
  else if (validator.constructor === LuftObject) {
    return fakeObject(validator) as LuftInfer<T>
  }
  // Any
  else if (validator.constructor === LuftAny) {
    return fakeAny(validator) as LuftInfer<T>
  }

  throw new Error(`Could not find a faker for ${getTypeOf(validator)}`)
}
