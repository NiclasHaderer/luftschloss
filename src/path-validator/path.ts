import { PathValidator } from "../core/route-collector.model"

const PathPathValidator: PathValidator<string> = {
  name: "uuid",
  validate(value: string): [true, string] | [false, null] {
    //TODO
  },
}

export const pathPathValidator = () => PathPathValidator
