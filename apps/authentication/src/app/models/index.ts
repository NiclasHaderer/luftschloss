import { LuftInfer, object, array, string } from "@luftschloss/validation";

export const CreateUserModel = object({
  username: string().min(3).max(20),
  password: string().min(8).max(20),
});

export type CreateUserModel = LuftInfer<typeof CreateUserModel>;

export const UpdateUserModel = object({
  username: string().min(3).max(20),
  oldPassword: string().min(8).max(20),
  newPassword: string().min(8).max(20),
});

export type UpdateUserModel = LuftInfer<typeof UpdateUserModel>;

export const JWKSModel = object({
  kty: string(),
  use: string(),
  kid: string(),
  n: string(),
  e: string(),
});

export type JWKSModel = LuftInfer<typeof JWKSModel>;

export const JWKSResponse = object({ keys: array(JWKSModel) });

export type JWKSResponse = LuftInfer<typeof JWKSResponse>;

export const JWTResponse = string();

export type JWTResponse = LuftInfer<typeof JWTResponse>;
