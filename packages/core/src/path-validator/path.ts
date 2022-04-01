import { PathValidator } from "./validator"

const PathPathValidator: PathValidator<string> = {
  name: "uuid",
  regex: /.*/,
  convert: value => value,
}

export const pathPathValidator = (): typeof PathPathValidator => PathPathValidator
