import {
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
  LuftURL,
  LuftUUIDString,
} from "@luftschloss/validation";
import { mockAny } from "./any";
import { mockArray } from "./array";
import { mockBool } from "./bool";
import { mockDate } from "./date";
import { mockInt } from "./int";
import { mockLiteral } from "./literal";
import { mockNever } from "./never";
import { mockNull } from "./null";
import { mockNumber } from "./number";
import { mockObject } from "./object";
import { mockRecord } from "./record";
import { mockString } from "./string";
import { mockTuple } from "./tuple";
import { mockUndefined } from "./undefined";
import { mockUnion } from "./union";
import { mockUUID } from "./uuid";
import { getCustomMock } from "./register-custom";
import { getTypeOf } from "@luftschloss/common";
import { mockURL } from "./url";

export const mockAll = <T extends LuftType | LuftNever>(validator: T, fieldName?: string): LuftInfer<T> => {
  // Null
  if (validator.constructor === LuftNull) {
    return mockNull() as LuftInfer<T>;
  }
  // Undefined
  if (validator.constructor === LuftUndefined) {
    return mockUndefined() as LuftInfer<T>;
  }
  // Int
  if (validator.constructor === LuftInt) {
    return mockInt(validator) as LuftInfer<T>;
  }
  // Number
  if (validator.constructor === LuftNumber) {
    return mockNumber(validator) as LuftInfer<T>;
  }
  // UUID
  if (validator.constructor === LuftUUIDString) {
    return mockUUID() as LuftInfer<T>;
  }
  // String
  if (validator.constructor === LuftString) {
    return mockString(validator, fieldName) as LuftInfer<T>;
  }
  // Union
  if (validator.constructor === LuftUnion) {
    return mockUnion(validator, fieldName) as LuftInfer<T>;
  }
  // Tuple
  if (validator.constructor === LuftTuple) {
    return mockTuple(validator, fieldName) as LuftInfer<T>;
  }
  // Never
  if (validator.constructor === LuftNever) {
    return mockNever() as LuftInfer<T>;
  }
  // Literal
  if (validator.constructor === LuftLiteral) {
    return mockLiteral(validator) as LuftInfer<T>;
  }
  // Date
  if (validator.constructor === LuftDate) {
    return mockDate(validator) as LuftInfer<T>;
  }
  // Array
  if (validator.constructor === LuftArray) {
    return mockArray(validator, fieldName) as LuftInfer<T>;
  }
  // Bool
  if (validator.constructor === LuftBool) {
    return mockBool() as LuftInfer<T>;
  }
  // Record
  if (validator.constructor === LuftRecord) {
    return mockRecord(validator) as LuftInfer<T>;
  }
  // Object
  if (validator.constructor === LuftObject) {
    return mockObject(validator) as LuftInfer<T>;
  }
  // URL
  if (validator.constructor === LuftURL) {
    return mockURL(validator) as LuftInfer<T>;
  }
  // Any
  if (validator.constructor === LuftAny) {
    return mockAny() as LuftInfer<T>;
  }

  const customMock = getCustomMock(validator as LuftType);
  if (customMock) {
    return customMock(validator as LuftType);
  }

  throw new Error(
    `Could not find a mocking factory for ${getTypeOf(validator)}. Add one yourself with \`registerMock\``
  );
};
