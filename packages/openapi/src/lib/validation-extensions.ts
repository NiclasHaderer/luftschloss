import { LuftBaseType, LuftValidationStorage } from "@luftschloss/validation"
import { Status } from "@luftschloss/server"

declare module "@luftschloss/validation" {
  export interface LuftBaseType {
    status(code: Status): this
  }

  export interface LuftValidationStorage {
    status?: Status
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Object.defineProperty(LuftBaseType.prototype, "status", {
  value: function (code: Status): LuftBaseType {
    ;(this.validationStorage as LuftValidationStorage).status = code
    return this
  },
})
