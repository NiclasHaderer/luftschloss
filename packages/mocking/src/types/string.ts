import { LuftInfer, LuftString } from "@luftschloss/validation";
import { StringFactories, stringFactory } from "./string-factory";

export const trimUntilFits = (stringToReturn: string, stringGenerator: () => string, min: number) => {
  stringToReturn = stringToReturn.trim();
  if (stringToReturn.length < min) {
    stringToReturn = stringToReturn + stringGenerator();
  }
  return stringToReturn;
};

export const mockString = (validator: LuftString, filedName?: string): LuftInfer<LuftString> => {
  const min = validator.schema.minLength ?? 0;
  const max = Math.min(validator.schema.maxLength ?? 10000, min + 10000);

  const factoryName = stringFactory(filedName);
  const stringGenerator: () => string = StringFactories[factoryName];

  let stringToReturn = stringGenerator();
  while (stringToReturn.length < min) {
    stringToReturn = stringToReturn + stringGenerator();
  }

  if (stringToReturn.length > max) {
    stringToReturn = stringToReturn.substring(0, max);
  }

  if (validator.schema.trim) {
    stringToReturn = trimUntilFits(stringToReturn, stringGenerator, min);
  }

  return stringToReturn;
};
