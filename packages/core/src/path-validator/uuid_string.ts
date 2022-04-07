/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { PathValidator } from "./validator"

const UUIDPathValidator: PathValidator<string> = {
  name: "uuid_string",
  regex: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
  convert: value => value,
}

export const uuidPathValidator = (): typeof UUIDPathValidator => UUIDPathValidator
