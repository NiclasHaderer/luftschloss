import { LuftType } from "@luftschloss/validation"
import { GeneratedSchema } from "./type"
import { generateJsonSchema } from "./all"

declare module "@luftschloss/validation" {
  export interface LuftType {
    generateJsonSchema(schemaPath: string): GeneratedSchema
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Object.defineProperty(LuftType.prototype, "generateJsonSchema", {
  value: function (schemaPath: string): GeneratedSchema {
    return generateJsonSchema(this, schemaPath)
  },
})
