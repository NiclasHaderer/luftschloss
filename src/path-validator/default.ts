import { PathValidator } from "./validator"
import { stringPathValidator } from "./string"

export const DEFAULT_VALIDATOR_KEY = "default" as const
const DefaultPathValidator: PathValidator<string> = {
  ...stringPathValidator(),
  name: DEFAULT_VALIDATOR_KEY,
}

export const defaultPathValidator = () => DefaultPathValidator
