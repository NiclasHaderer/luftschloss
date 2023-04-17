import { AuthMiddleware, HTTPException, LRequest, ValidToken } from "@luftschloss/server";
import { Cache } from "@luftschloss/common";
import { JWKsResponse, JWT, JwtHeader, JwtPayload } from "../models";
import * as crypto from "crypto";

const DEMO_JWKS = {
  keys: [
    {
      kty: "RSA",
      e: "AQAB",
      use: "sig",
      kid: "luftschloss",
      alg: "RS256",
      n: "lzRszUeQ4WiSqvmYxMP10ngm8ALIoUwMH7Oa8vrZgD5pqalPjetPAxeVcAv2gTyDlOwtB0fGvlQo6n78pd9pTbgrzUjhmFuYN6OCfT6eN_2wu0LmwryFS2mbh7_1DTiKd2tZaRalskPECXTKkeks85HVqanB0860BYlGvQvfgrvhCWXXFJJeXvNwYNFYdDdrFQhoeOAEvRDKg9DdHZf6XzSR6Qk3w51FKn2b7imen_G52itD_kIen1hqqB2Jwt9SWyX5MSGySY2QwC18F6Dfs8L-t0mwCo6grGW9264Z5vlO0PWssEqGIX_ez6nk1ZdHXhoXwJ0W-6QzeQlUN8jNoQ",
    },
  ],
};

export class JwtMiddleware extends AuthMiddleware<JWT, string> {
  constructor(private jwksEndpoint: string) {
    super();
  }

  @Cache()
  public jwksResponse(): JWKsResponse {
    return JWKsResponse.coerce(DEMO_JWKS);
    // const jwksResponse = get(this.jwksEndpoint)
    //   .send()
    //   .then(r => r.json());
    // return JWKsResponse.coerce(jwksResponse);
  }

  public async extractToken(req: LRequest): Promise<JWT> {
    if (!req.headers.has("Authorization")) throw new HTTPException(403, "No 'Authorization' header present");
    const authHeader = req.headers.get("Authorization")!;
    if (!authHeader.startsWith("Bearer ")) throw new HTTPException(403, "No Bearer token present");
    try {
      return await this.decodeJwt(authHeader.substring("Bearer ".length));
    } catch (e) {
      throw HTTPException.wrap(e, 400);
    }
  }

  protected async decodeJwt(jwtStr: string): Promise<JWT> {
    const jwtParts = jwtStr.split(".");
    if (jwtParts.length !== 3) throw new HTTPException(400, "Invalid JWT format");
    const [header, payload, signature] = jwtParts;
    const decodedHeader = JwtHeader.tryParseString(true).coerce(atob(header));
    const decodedPayload = JwtPayload.tryParseString(true).coerce(atob(payload));
    const jwt = { header: decodedHeader, payload: decodedPayload };
    const isValid = await this.isSignatureValid(jwt, header, payload, signature);
    if (!isValid) {
      throw new HTTPException(400, "JWT signature invalid");
    }
    return jwt;
  }

  protected async isSignatureValid(jwt: JWT, header: string, payload: string, signature: string): Promise<boolean> {
    let jwks;
    try {
      jwks = await this.jwksResponse();
    } catch (e) {
      throw HTTPException.wrap(e, 500);
    }

    const key = jwks.keys.find(e => e.kid === jwt.header.kid && e.alg === "RS256");
    if (!key) throw new HTTPException(400, `No key found for kid ${jwt.header.kid}`);

    // Create the RSA public key
    const publicKey = crypto.createPublicKey({
      format: "jwk",
      key: {
        kty: key.kty,
        n: key.n,
        e: key.e,
      },
    });
    return crypto.verify(
      "RSA-SHA256",
      toArrayBufferView(`${header}.${payload}`),
      publicKey,
      toArrayBufferView(signature)
    );
  }

  public extractUserId(req: LRequest, token: JWT): Promise<string> | string {
    return token.payload.sub;
  }

  public validateToken(token: JWT): ValidToken {
    return {
      isValid: token.payload.exp < Date.now(),
      reason: "Token expired",
    };
  }
}

const toArrayBufferView = (str: string): Uint8Array => {
  return new Uint8Array(new TextEncoder().encode(str));
};
