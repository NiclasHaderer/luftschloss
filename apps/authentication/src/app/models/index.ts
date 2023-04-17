import { array, LuftInfer, object, string } from "@luftschloss/validation";

export const CreateUser = object({
  username: string().min(3).max(20),
  password: string().min(8).max(20),
});

export type CreateUser = LuftInfer<typeof CreateUser>;

export const UpdatePassword = object({
  username: string().min(3).max(20),
  oldPassword: string().min(8).max(20),
  newPassword: string().min(8).max(20),
});

export type UpdatePassword = LuftInfer<typeof UpdatePassword>;

export const JWK = object({
  kty: string(),
  use: string(),
  kid: string(),
  n: string(),
  e: string(),
});
export type JWK = LuftInfer<typeof JWK>;

export const JWKSResponse = object({ keys: array(JWK) });

export type JWKSResponse = LuftInfer<typeof JWKSResponse>;

export const JWTResponse = object({
  token: string(),
});
