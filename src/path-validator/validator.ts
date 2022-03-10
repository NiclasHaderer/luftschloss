import { escapeRegexString, normalizePath } from "../core/utils"
import { DEFAULT_PATH_VALIDATOR_NAME } from "./default"

type ValidatorName = string

export type PathValidators = Record<ValidatorName, PathValidator<any>>

export type PathValidator<T extends {}> = {
  name: ValidatorName
  regex: RegExp
  convert(value: string): T
}

const IS_EXTRACTOR = /^{([a-zA-Z0-9_]+)(:[a-zA-Z0-9_]+)?}$/

export const toRegex = (path: string, validators: PathValidators): RegExp => {
  path = normalizePath(path)

  type PathParamName = string
  const asdf: Record<PathParamName, PathValidator<any>["convert"]> = {}

  const regexString = path
    .split("/")
    .map(value => {
      const match = value.match(IS_EXTRACTOR)
      if (!match) return escapeRegexString(value)
      const pathParamName = match.groups![0]
      const pathParamExtractor = match.groups![1] || DEFAULT_PATH_VALIDATOR_NAME

      if (!(pathParamExtractor in validators)) {
        throw new Error(`Path validator with name ${pathParamExtractor} was not found. Please add it to the server.`)
      }

      const extractor = validators[pathParamExtractor]
      asdf[pathParamName] = extractor.convert
      return `(?<${pathParamName}>${extractor.regex.source})`
    })
    .join("/")

  return new RegExp(`^${regexString}$`, "i")
}
