export interface Jwks {
  kty: string;
  use: string;
  kid: string;
  n: string;
  e: string;
}

type JwksId = string;

export interface JwksResponse {
  keys: Record<JwksId, Jwks>;
}
