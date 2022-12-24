/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { escapeRegexString, normalizePath, saveObject } from "@luftschloss/common"
import { DEFAULT_PATH_VALIDATOR_NAME } from "./default"

type ValidatorName = string

export type PathValidators = Record<ValidatorName, PathValidator<unknown>>

export type PathValidator<T> = {
  name: ValidatorName
  regex: RegExp
  convert(this: void, value: string): T
}

const GET_PATH_SEGMENT_EXTRACTOR = /^{((?<var1>\w+)(?::(?<type1>\w+))?)|((?<var2>\w+)?(?::(?<type2>\w+)))}$/
const CONTAINS_EXTRACTOR = /(?:\/|^){((\w+)(?::(\w+))?)|((\w+)?(?::(\w+)))}(?:\/|$)/

export const containsRegex = (path: string): boolean => CONTAINS_EXTRACTOR.test(path)

type PathParamName = string

const getParamsFromMath = (
  match: RegExpMatchArray
): {
  pathParamName: string
  pathParamExtractor: string
  ignoreVar: boolean
} => {
  let varName: string | undefined
  let type: string | undefined
  let ignoreVar = false
  if (match.groups!["var1"]) {
    // Here the type can be undefined
    varName = match.groups!["var1"]
    type = match.groups!["type1"] || DEFAULT_PATH_VALIDATOR_NAME
  } else {
    // Here the variable name can be undefined
    varName = match.groups!["var2"]
    type = match.groups!["type2"]
    if (!varName) {
      ignoreVar = true
      varName = Math.random().toString()
    }
  }
  return {
    pathParamName: varName,
    pathParamExtractor: type,
    ignoreVar,
  }
}

/**
 * Take a certain path and convert it to a regex, which will be used to match the *complete* path
 * @param path The path which will be converted to a regular expression. The path will get normalized to useing the
 * `normalizePath` method
 * @param validators An object with the different path validators in it. The keys of the object are the names of the path
 * validators
 * @param openEnd If the regex should contain an open end the $ operator will not be placed at the end of it
 */
export const pathToRegex = (path: string, validators: PathValidators, openEnd = false): RegExp => {
  path = normalizePath(path)

  const pathConverters: Record<PathParamName, PathValidator<unknown>["convert"]> = saveObject()

  const regexString = path
    .split("/")
    .map(value => {
      const match = value.match(GET_PATH_SEGMENT_EXTRACTOR)
      if (!match) return escapeRegexString(value)
      const { pathParamExtractor, pathParamName, ignoreVar } = getParamsFromMath(match)

      if (!(pathParamExtractor in validators)) {
        throw new Error(`Path validator with name ${pathParamExtractor} was not found. Please add it to the router.`)
      }

      // Get the specific path validator used to validate and convert the valudes
      const extractor = validators[pathParamExtractor]
      // Save the conversion method
      pathConverters[pathParamName] = extractor.convert

      if (ignoreVar) {
        return `(?:${extractor.regex.source})`
      }
      // And build the resulting regex with a regex group, so it is easy to retrieve the extracted name later on after
      // the route match
      return `(?<${pathParamName}>${extractor.regex.source})`
    })
    .join("/")

  // Finished regex. We do not care about the case in this case
  return new RegExp(`^${regexString}${openEnd ? "" : "$"}`, "i")
}
