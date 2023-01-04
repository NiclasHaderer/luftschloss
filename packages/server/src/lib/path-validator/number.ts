/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { PathValidator } from "./validator";

const NumberPathValidator: PathValidator<number> = {
  name: "number",
  regex: /[+-]?(?:[0-9]*\.)?[0-9]+/,
  convert: (value: string) => parseFloat(value),
};

export const numberPathValidator = (): typeof NumberPathValidator => NumberPathValidator;
