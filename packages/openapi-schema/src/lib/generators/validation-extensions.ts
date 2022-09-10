import { LuftType } from "@luftschloss/validation"
import { GeneratedSchema } from "./type"
import { generateJsonSchema } from "./all"
import "@luftschloss/validation"

declare module "@luftschloss/validation" {
  interface LuftType {
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
