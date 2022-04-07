/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { PathValidator } from "./validator"
import { stringPathValidator } from "./string"

export const DEFAULT_PATH_VALIDATOR_NAME = "default" as const
const DefaultPathValidator: PathValidator<string> = {
  ...stringPathValidator(),
  name: DEFAULT_PATH_VALIDATOR_NAME,
}

export const defaultPathValidator = (): typeof DefaultPathValidator => DefaultPathValidator
