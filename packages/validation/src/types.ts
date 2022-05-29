/*
 * luftschloss
 * Copyright (c) 2022. Niclas
 * MIT Licensed
 */

import { LuftBaseType } from "./types/base-type"

export type LuftTypeOf<T extends LuftBaseType<unknown>> = ReturnType<T["validate"]>
