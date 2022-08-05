import { LuftBaseType } from "./types/base-type"

export type LuftInfer<T extends LuftBaseType<unknown>> = T extends LuftBaseType<infer U> ? U : never
