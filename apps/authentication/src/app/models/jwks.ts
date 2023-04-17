import { array, LuftInfer, object, string } from "@luftschloss/validation";

export const JWK = object({
  kty: string(),
  alg: string(),
  use: string(),
  kid: string(),
  n: string(),
  e: string(),
});
export type JWK = LuftInfer<typeof JWK>;

export const JWKsResponse = object({
  keys: array(JWK),
});

export type JWKsResponse = LuftInfer<typeof JWKsResponse>;
