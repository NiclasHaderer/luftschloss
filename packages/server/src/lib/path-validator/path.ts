/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { PathValidator } from "./validator";

const PathPathValidator: PathValidator<string> = {
  name: "path",
  regex: /.*/,
  convert: value => value,
};

export const pathPathValidator = (): typeof PathPathValidator => PathPathValidator;
