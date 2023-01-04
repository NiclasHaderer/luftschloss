import { LuftInfer, LuftNever } from "@luftschloss/validation";

export const mockNever = (): LuftInfer<LuftNever> => {
  throw new Error("Never cannot be mocked");
};
