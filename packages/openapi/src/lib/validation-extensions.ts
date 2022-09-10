import { LuftType, LuftValidationStorage } from "@luftschloss/validation"
import { Status, toStatus } from "@luftschloss/server"
import "@luftschloss/validation"

declare module "@luftschloss/validation" {
  interface LuftType {
    status(code: Status | number): this
  }

  interface LuftValidationStorage {
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
