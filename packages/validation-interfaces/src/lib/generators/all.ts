import {
  LuftAny,
  LuftArray,
  LuftBool,
  LuftDate,
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

type LuftInterface =
  | {
      named: boolean;
      name: string;
      inlined: boolean;
      schema: string;
    }
  | {
      named: false;
      name?: undefined;
      inlined: true;
      schema: string;
    };

export const generateInterfaceForNull = (type: LuftNull): LuftInterface => ({
  named: false,
  inlined: true,
  schema: "null",
});

export const generateInterfaceForUndefined = (type: LuftUndefined): LuftInterface => ({
  named: false,
  inlined: true,
  schema: "undefined",
});

export const generateInterfaceForInt = (type: LuftInt): LuftInterface => ({
  named: false,
  inlined: true,
  schema: "int",
});

export const generateInterfaceForNumber = (type: LuftNumber): LuftInterface => ({
  named: false,
  inlined: true,
  schema: "number",
});

export const generateInterfaceForUUIDString = (type: LuftUUIDString): LuftInterface => ({
  named: false,
  inlined: true,
  schema: "`${string}-${string}-${string}-${string}-${string}`",
});

export const generateInterfaceForString = (type: LuftString): LuftInterface => ({
  named: false,
  inlined: true,
  schema: "string",
});

export const generateInterfaceForUnion = (type: LuftUnion<any>) =>
  ({
    named: type.validationStorage.name !== undefined,
    name: type.validationStorage.name,
    inlined: type.validationStorage.name !== undefined,
    schema: type.schema.types.flatMap(generateInterfaceFor).join(" | "),
  } as LuftInterface);

export const generateInterfaceForTuple = (type: LuftTuple<any>): LuftInterface : LuftInterface  => {};

export const generateInterfaceForNever = (type: LuftNever): LuftInterface  => {};

export const generateInterfaceForLiteral = (type: LuftLiteral<any>): LuftInterface  => {};

export const generateInterfaceForDate = (type: LuftDate): LuftInterface  => {};

export const generateInterfaceForAny = (type: LuftAny): LuftInterface  => {};

export const generateInterfaceForArray = (type: LuftArray<any>): LuftInterface  => {};

export const generateInterfaceForBool = (type: LuftBool): LuftInterface  => {};

export const generateInterfaceForRecord = (type: LuftRecord<any, any>): LuftInterface  => {};

export const generateInterfaceForObject = (type: LuftObject<any>): LuftInterface  => {};

export const generateInterfaceForURL = (type: LuftURL): LuftInterface  => {};

export const generateInterfaceFor = (type: LuftType): LuftInterface => {
  // Null
  if (type.constructor === LuftNull) {
    return generateInterfaceForNull(type);
  }
  // Undefined
  if (type.constructor === LuftUndefined) {
    return generateInterfaceForUndefined(type);
  }
  // Int
  if (type.constructor === LuftInt) {
    return generateInterfaceForInt(type);
  }
  // Number
  if (type.constructor === LuftNumber) {
    return generateInterfaceForNumber(type);
  }
  // UUID
  if (type.constructor === LuftUUIDString) {
    return generateInterfaceForUUIDString(type);
  }
  // String
  if (type.constructor === LuftString) {
    return generateInterfaceForString(type);
  }
  // Union
  if (type.constructor === LuftUnion) {
    return generateInterfaceForUnion(type);
  }
  // Tuple
  if (type.constructor === LuftTuple) {
    return generateInterfaceForTuple(type);
  }
  // Never
  if (type.constructor === LuftNever) {
    return generateInterfaceForNever(type);
  }
  // Literal
  if (type.constructor === LuftLiteral) {
    return generateInterfaceForLiteral(type);
  }
  // Date
  if (type.constructor === LuftDate) {
    return generateInterfaceForDate(type);
  }
  // Array
  if (type.constructor === LuftArray) {
    return generateInterfaceForArray(type);
  }
  // Bool
  if (type.constructor === LuftBool) {
    return generateInterfaceForBool(type);
  }
  // Record
  if (type.constructor === LuftRecord) {
    return generateInterfaceForRecord(type);
  }
  // Object
  if (type.constructor === LuftObject) {
    return generateInterfaceForObject(type);
  }
  // URL
  if (type.constructor === LuftURL) {
    return generateInterfaceForURL(type);
  }
  // Any
  if (type.constructor === LuftAny) {
    return generateInterfaceForAny(type);
  }
};
