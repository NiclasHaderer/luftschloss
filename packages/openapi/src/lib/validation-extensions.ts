import { LuftType, LuftValidationStorage } from "@luftschloss/validation"
import { Status, toStatus } from "@luftschloss/server"

declare module "@luftschloss/validation" {
  export interface LuftType {
    status(code: Status | number): this
  }

  export interface LuftValidationStorage {
    status?: Status
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Object.defineProperty(LuftType.prototype, "status", {
  value: function (code: Status | number): LuftType {
    ;(this.validationStorage as LuftValidationStorage).status = toStatus(code)
    return this
  },
})
