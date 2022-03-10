import { PathValidator } from "./validator"

const NumberPathValidator: PathValidator<number> = {
  name: "number",
  regex: /[+-]?(?:[0-9]*[.])?[0-9]+/,
  convert(value: string): number {
    return parseFloat(value)
  },
}

export const numberPathValidator = () => NumberPathValidator
