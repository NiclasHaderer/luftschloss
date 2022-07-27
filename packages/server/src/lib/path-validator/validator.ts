/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { escapeRegexString, normalizePath, saveObject } from "@luftschloss/core"
import { DEFAULT_PATH_VALIDATOR_NAME } from "./default"

type ValidatorName = string

export type PathValidators = Record<ValidatorName, PathValidator<unknown>>

export type PathValidator<T> = {
  name: ValidatorName
  regex: RegExp
  convert(this: void, value: string): T
}

type PathParamName = string
export type PathConverter = Record<PathParamName, PathValidator<unknown>["convert"]>
const IS_EXTRACTOR = /^{(\w+)(?::(\w+))?}$/
const CONTAINS_EXTRACTOR = /(?:\/|^){(\w+)(?::(\w+))?}(?:\/|$)/

export const containsRegex = (path: string): boolean => CONTAINS_EXTRACTOR.test(path)

/**
 * Take a certain path and convert it to a regex, which will be used to match the *complete* path
 * @param path The path which will be converted to a regular expression. The path will get normalized to useing the
 * `normalizePath` method
 * @param validators An object with the different path validators in it. The keys of the object are the names of the path
 * validators
 */
export const pathToRegex = (path: string, validators: PathValidators): [RegExp, PathConverter] => {
  path = normalizePath(path)

  const pathConverters: Record<PathParamName, PathValidator<unknown>["convert"]> = saveObject()

  const regexString = path
    .split("/")
    .map(value => {
      const match = value.match(IS_EXTRACTOR)
      if (!match) return escapeRegexString(value)
      // Get the name of the path validator
      const pathParamName = match[1]
      // And get the validation regex. If there is no validation regex, just use the default one
      const pathParamExtractor = match[2] || DEFAULT_PATH_VALIDATOR_NAME

      if (!(pathParamExtractor in validators)) {
        throw new Error(`Path validator with name ${pathParamExtractor} was not found. Please add it to the router.`)
      }

      // Get the specific path validator used to validate and convert the valudes
      const extractor = validators[pathParamExtractor]
      // Save the conversion method
      pathConverters[pathParamName] = extractor.convert
      // And build the resulting regex with a regex group, so it is easy to retrieve the extracted name later on after
      // the route match
      return `(?<${pathParamName}>${extractor.regex.source})`
    })
    .join("/")

  // Finished regex. We do not care about the case in this case
  return [new RegExp(`^${regexString}$`, "i"), pathConverters]
}
