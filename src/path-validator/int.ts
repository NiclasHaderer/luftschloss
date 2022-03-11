import { PathValidator } from "./validator"

const IntPathValidator: PathValidator<number> = {
  name: "int",
  regex: /[+-]?\d+/,
  convert(value: string): number {
    return parseInt(value, 10)
  },
}

export const intPathValidator = () => IntPathValidator
