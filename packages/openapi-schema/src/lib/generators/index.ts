import { LuftBaseType } from "@luftschloss/validation"
import { generateJsonSchema } from "./all"
import { GeneratedSchema } from "./type"

export * from "./all"
export * from "./any"
export * from "./array"
export * from "./bool"
export * from "./date"
export * from "./int"
export * from "./literal"
export * from "./never"
export * from "./null"
export * from "./number"
export * from "./object"
export * from "./record"
export * from "./regex"
export * from "./register-custom"
export * from "./string"
export * from "./tuple"
export * from "./undefined"
export * from "./union"

declare module "@luftschloss/validation" {
  export interface LuftBaseType {
    generateJsonSchema(schemaPath: string): GeneratedSchema
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Object.defineProperty(LuftBaseType.prototype, "generateJsonSchema", {
  value: function (schemaPath: string): GeneratedSchema {
    return generateJsonSchema(this, schemaPath)
  },
})
