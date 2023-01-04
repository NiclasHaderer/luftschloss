/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { PathValidator } from "./validator";

const IntPathValidator: PathValidator<number> = {
  name: "int",
  regex: /[+-]?\d+/,
  convert: (value: string) => parseInt(value, 10),
};

export const intPathValidator = (): typeof IntPathValidator => IntPathValidator;
