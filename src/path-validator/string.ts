import { PathValidator } from "../core/route-collector.model"

const StringPathValidator: PathValidator<string> = {
  name: "string",
  validate(value: string): [true, string] {
    return [true, value]
  },
}

export const stringPathValidator = () => StringPathValidator
