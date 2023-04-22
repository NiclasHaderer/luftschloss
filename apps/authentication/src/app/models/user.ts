import { LuftErrorCodes, LuftInfer, object, string } from "@luftschloss/validation";

const Password = string()
  .min(8)
  .max(20)
  .afterHook((value, ctx) => {
    let hasError = false;
    if (!/[A-Z]/.test(value)) {
      ctx.addIssue({
        code: LuftErrorCodes.INVALID_VALUE,
        message: "Password must contain at least one uppercase letter",
        path: [...ctx.path],
        allowedValues: [],
        receivedValue: value,
      });
      hasError = true;
    }
    if (!/[a-z]/.test(value)) {
      ctx.addIssue({
        code: LuftErrorCodes.INVALID_VALUE,
        message: "Password must contain at least one lowercase letter",
        path: [...ctx.path],
        allowedValues: [],
        receivedValue: value,
      });
    }
    if (!/[0-9]/.test(value)) {
      ctx.addIssue({
        code: LuftErrorCodes.INVALID_VALUE,
        message: "Password must contain at least one number",
        path: [...ctx.path],
        allowedValues: [],
        receivedValue: value,
      });
      hasError = true;
    }
    const specialChars = /[!@#$%^&*()_+-=[\]{};':"|,.<>/?]/;
    if (!specialChars.test(value)) {
      ctx.addIssue({
        code: LuftErrorCodes.INVALID_VALUE,
        message: "Password must contain at least one special character",
        path: [...ctx.path],
        allowedValues: [specialChars.source],
        receivedValue: value,
      });
      hasError = true;
    }

    if (hasError) {
      return {
        action: "abort",
      };
    } else {
      return {
        action: "continue",
        data: value,
      };
    }
  });

export const CreateUser = object({
  username: string().min(3).max(20),
  password: Password,
});
export type CreateUser = LuftInfer<typeof CreateUser>;

export const LoginUser = object({
  username: string().min(3).max(20),
  password: string().min(8).max(20),
});
export type LoginUser = LuftInfer<typeof LoginUser>;

export const UpdatePassword = object({
  username: string().min(3).max(20),
  oldPassword: string().min(8).max(20),
  newPassword: Password,
});

export type UpdatePassword = LuftInfer<typeof UpdatePassword>;
