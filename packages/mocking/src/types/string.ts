import { LuftInfer, LuftString } from "@luftschloss/validation"
import { StringFactories, stringFactory } from "./string-factory"

export const trimUntilFits = (stringToReturn: string, stringGenerator: () => string, min: number) => {
  stringToReturn = stringToReturn.trim()
  if (stringToReturn.length < min) {
    stringToReturn = stringToReturn + stringGenerator()
  }
  return stringToReturn
}

export const fakeString = (validator: LuftString, filedName?: string): LuftInfer<LuftString> => {
  const min = validator.schema.minLength < 0 ? 0 : validator.schema.minLength
  const max = validator.schema.maxLength === Infinity ? Math.max(1000, min + 1000) : validator.schema.maxLength
  const factoryName = stringFactory(filedName)
  const stringGenerator: () => string = StringFactories[factoryName]

  let stringToReturn = stringGenerator()
  while (stringToReturn.length < min) {
    stringToReturn = stringToReturn + stringGenerator()
  }

  if (stringToReturn.length > max) {
    stringToReturn = stringToReturn.substring(0, max)
  }

  if (validator.schema.trim) {
    stringToReturn = trimUntilFits(stringToReturn, stringGenerator, min)
  }

  return stringToReturn
}
