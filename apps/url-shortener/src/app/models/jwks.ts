import { LuftInfer, object, record, string } from "@luftschloss/validation";

export const JWK = object({
  kty: string(),
  use: string(),
  kid: string(),
  n: string(),
  e: string(),
});
export type JWK = LuftInfer<typeof JWK>;

export const JWKsResponse = object({
  keys: record(string(), JWK),
});

export type JWKsResponse = LuftInfer<typeof JWKsResponse>;
