import { PathValidator } from "./validator"

const StringPathValidator: PathValidator<string> = {
  name: "string",
  regex: /[^/]+/,
  convert: value => value,
}

export const stringPathValidator = (): typeof StringPathValidator => StringPathValidator
