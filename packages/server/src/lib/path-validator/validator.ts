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

export const pathToRegex = (path: string, validators: PathValidators): [RegExp, PathConverter] => {
  path = normalizePath(path)

  const pathConverters: Record<PathParamName, PathValidator<unknown>["convert"]> = saveObject()

  const regexString = path
    .split("/")
    .map(value => {
      const match = value.match(IS_EXTRACTOR)
      if (!match) return escapeRegexString(value)
      const pathParamName = match[1]
      const pathParamExtractor = match[2] || DEFAULT_PATH_VALIDATOR_NAME

      if (!(pathParamExtractor in validators)) {
        throw new Error(`Path validator with name ${pathParamExtractor} was not found. Please add it to the server.`)
      }

      const extractor = validators[pathParamExtractor]
      pathConverters[pathParamName] = extractor.convert
      return `(?<${pathParamName}>${extractor.regex.source})`
    })
    .join("/")

  return [new RegExp(`^${regexString}$`, "i"), pathConverters]
}
