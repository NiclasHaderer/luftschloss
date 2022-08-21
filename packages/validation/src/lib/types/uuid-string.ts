/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { LuftRegexp } from "./regexp"

export class LuftUUIDString extends LuftRegexp {
  public constructor() {
    super({ regex: /[a-fA-F\d]{8}-[a-fA-F\d]{4}-[a-fA-F\d]{4}-[a-fA-F\d]{4}-[a-fA-F\d]{12}/ })
  }
}

// TODO add this to string.uuid() method
