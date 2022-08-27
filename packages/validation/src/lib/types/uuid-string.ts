/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { LuftRegex } from "./regexp"

export class LuftUUIDString extends LuftRegex {
  public constructor() {
    super({ regex: /[a-fA-F\d]{8}-[a-fA-F\d]{4}-[a-fA-F\d]{4}-[a-fA-F\d]{4}-[a-fA-F\d]{12}/ })
  }
}
