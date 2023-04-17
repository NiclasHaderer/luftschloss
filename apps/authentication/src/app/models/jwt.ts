import { LuftInfer, number, object, string } from "@luftschloss/validation";

export const JwtHeader = object({
  alg: string(),
  typ: string(),
  kid: string(),
});
export type JwtHeader = LuftInfer<typeof JwtHeader>;

export const JwtPayload = object({
  sub: string(),
  iss: string(),
  iat: number(),
  exp: number(),
});
export type JwtPayload = LuftInfer<typeof JwtPayload>;

export const JWT = object({
  header: JwtHeader,
  payload: JwtPayload,
});
export type JWT = LuftInfer<typeof JWT>;

export const JWTResponse = object({
  token: string(),
});
export type JWTResponse = LuftInfer<typeof JWTResponse>;
