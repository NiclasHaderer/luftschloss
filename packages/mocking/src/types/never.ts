import { LuftInfer, LuftNever } from "@luftschloss/validation"

export const fakeNever = (_: LuftNever): LuftInfer<LuftNever> => {
  throw new Error("Never cannot be mocked")
}
