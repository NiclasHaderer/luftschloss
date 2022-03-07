import { PathValidator } from "../core/route-collector.model"

const UUIDPathValidator: PathValidator<string> = {
  name: "uuid",
  validate(value: string): [true, string] | [false, null] {
    //TODO
  },
}

export const uuidPathValidator = () => UUIDPathValidator
