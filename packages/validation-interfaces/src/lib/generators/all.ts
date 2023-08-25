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
import { getTypeOf } from "@luftschloss/common";
import { getCustomInterfaceGenerator } from "../custom";
import { generateInterfaceForNull } from "./null";
import { generateInterfaceForUndefined } from "./undefined";
import { generateInterfaceForInt } from "./int";
import { generateInterfaceForNumber } from "./number";
import { generateInterfaceForUUIDString } from "./uuid";
import { generateInterfaceForString } from "./string";
import { generateInterfaceForUnion } from "./union";
import { generateInterfaceForTuple } from "./touple";
import { generateInterfaceForNever } from "./never";
import { generateInterfaceForLiteral } from "./literal";
import { generateInterfaceForDate } from "./date";
import { generateInterfaceForArray } from "./array";
import { generateInterfaceForBool } from "./bool";
import { generateInterfaceForRecord } from "./record";
import { generateInterfaceForObject } from "./object";
import { generateInterfaceForURL } from "./url";
import { generateInterfaceForAny } from "./any";

export type LuftInterface = (
  | {
      named: true;
      name: string;
      inlined: boolean;
      schema: string;
    }
  | {
      named: false;
      name?: undefined;
      inlined: true;
      schema: string;
    }
) & {
  reference(): string;
};

export type GenerateSubType = (type: LuftType) => LuftInterface;

export type GeneratedInterfaces = {
  main: LuftInterface;
  all: LuftInterface[];
};

export const generateInterfaceFor = (type: LuftType, generateSubType?: GenerateSubType): GeneratedInterfaces => {
  const interfaces: { main?: LuftInterface; all: LuftInterface[] } = {
    main: undefined,
    all: [],
  };

  generateSubType =
    generateSubType ??
    ((type: LuftType) => {
      const subInterfaces = generateInterfaceFor(type, generateSubType);
      interfaces.all.push(...subInterfaces.all);
      return subInterfaces.main;
    });

  // Null
  if (type.constructor === LuftNull) {
    interfaces.all.push(generateInterfaceForNull(type));
  }
  // Undefined
  else if (type.constructor === LuftUndefined) {
    interfaces.all.push(generateInterfaceForUndefined(type));
  }
  // Int
  else if (type.constructor === LuftInt) {
    interfaces.all.push(generateInterfaceForInt(type));
  }
  // Number
  else if (type.constructor === LuftNumber) {
    interfaces.all.push(generateInterfaceForNumber(type));
  }
  // UUID
  else if (type.constructor === LuftUUIDString) {
    interfaces.all.push(generateInterfaceForUUIDString(type));
  }
  // String
  else if (type.constructor === LuftString) {
    interfaces.all.push(generateInterfaceForString(type));
  }
  // Union
  else if (type.constructor === LuftUnion) {
    interfaces.all.push(generateInterfaceForUnion(type, generateSubType));
  }
  // Tuple
  else if (type.constructor === LuftTuple) {
    interfaces.all.push(generateInterfaceForTuple(type, generateSubType));
  }
  // Never
  else if (type.constructor === LuftNever) {
    interfaces.all.push(generateInterfaceForNever(type));
  }
  // Literal
  else if (type.constructor === LuftLiteral) {
    interfaces.all.push(generateInterfaceForLiteral(type));
  }
  // Date
  else if (type.constructor === LuftDate) {
    interfaces.all.push(generateInterfaceForDate(type));
  }
  // Array
  else if (type.constructor === LuftArray) {
    interfaces.all.push(generateInterfaceForArray(type, generateSubType));
  }
  // Bool
  else if (type.constructor === LuftBool) {
    interfaces.all.push(generateInterfaceForBool(type));
  }
  // Record
  else if (type.constructor === LuftRecord) {
    interfaces.all.push(generateInterfaceForRecord(type, generateSubType));
  }
  // Object
  else if (type.constructor === LuftObject) {
    interfaces.all.push(generateInterfaceForObject(type, generateSubType));
  }
  // URL
  else if (type.constructor === LuftURL) {
    interfaces.all.push(generateInterfaceForURL(type));
  }
  // Any
  else if (type.constructor === LuftAny) {
    interfaces.all.push(generateInterfaceForAny(type));
  } else {
    const customGenerator = getCustomInterfaceGenerator(type);
    if (!customGenerator)
      throw new Error(
        `No interface generator found for ${getTypeOf(type)}. Add one yourself with \`registerInterfaceGenerator\``
      );
    interfaces.all.push(customGenerator(type, generateSubType));
  }
  interfaces.main = interfaces.all.at(-1);

  return interfaces as GeneratedInterfaces;
};
